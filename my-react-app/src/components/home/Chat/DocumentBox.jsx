import React, { useState, useEffect, useRef } from "react";
import { IoDocumentText, IoArrowBack, IoCloudUpload } from "react-icons/io5";
import { MdClose, MdAttachFile, MdDownload } from "react-icons/md";
import { BsCheckAll, BsCheck } from "react-icons/bs";
import { gql, useMutation } from "@apollo/client";

const getDocumentsQuery = gql`
  mutation getDocuments($sender: String!, $receiver: String!) {
    getDocuments(sender: $sender, receiver: $receiver) {
      _id
      sender
      receiver
      fileName
      originalName
      fileSize
      fileType
      fileUrl
      description
      timestamp
      isSeen
    }
  }
`;

const DocumentBox = ({
  selectedUserToChat,
  setSelectedUserToChat,
  socket,
  self,
  onBack
}) => {
  const [documents, setDocuments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState("");
  const fileInputRef = useRef(null);
  const documentsEndRef = useRef(null);

  const [getDocuments] = useMutation(getDocumentsQuery, {
    onCompleted: (data) => {
      setDocuments(data.getDocuments || []);
    },
    onError: (err) => {
      console.error("Error fetching documents:", err);
    },
  });

  useEffect(() => {
    if (self?.username && selectedUserToChat) {
      getDocuments({
        variables: { sender: self.username, receiver: selectedUserToChat },
      });
    }
  }, [self?.username, selectedUserToChat, getDocuments]);

  useEffect(() => {
    const handleReceiveDocument = ({ sender, receiver, document }) => {
      if (
        (sender === selectedUserToChat && receiver === self?.username) ||
        (sender === self?.username && receiver === selectedUserToChat)
      ) {
        setDocuments((prev) => [...prev, document]);
      }
    };

    socket.on("receiveDocument", handleReceiveDocument);
    return () => {
      socket.off("receiveDocument", handleReceiveDocument);
    };
  }, [socket, selectedUserToChat, self?.username]);

  useEffect(() => {
    documentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [documents]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const uploadDocuments = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('sender', self.username);
        formData.append('receiver', selectedUserToChat);
        formData.append('description', description);

        // Upload to backend
        const response = await fetch('http://localhost:3000/api/documents/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include', // Include session cookies
        });

        if (response.ok) {
          const documentData = await response.json();
          
          // Emit socket event
          socket.emit("sendDocument", {
            sender: self.username,
            receiver: selectedUserToChat,
            document: documentData,
          });

          // Add to local state
          setDocuments(prev => [...prev, documentData]);
        } else {
          throw new Error('Upload failed');
        }
      }

      setSelectedFiles([]);
      setDescription("");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      alert("Error uploading documents. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!selectedUserToChat) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <IoDocumentText className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-600">Choose someone to share documents with</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-lg px-4 md:px-6 py-3 md:py-4 border-b border-purple-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="!p-2 !rounded-full hover:!bg-purple-100 !transition-colors"
          >
            <IoArrowBack className="text-purple-600" size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {selectedUserToChat?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">
                Documents with {selectedUserToChat}
              </h3>
              <p className="text-sm text-purple-600">
                {documents.length} document{documents.length !== 1 ? 's' : ''} shared
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <IoDocumentText className="w-16 h-16 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No documents yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start sharing documents with {selectedUserToChat}
            </p>
          </div>
        ) : (
          documents.map((doc, idx) => {
            const isOwn = doc.sender === self?.username;
            
            return (
              <div
                key={doc._id || idx}
                ref={idx === documents.length - 1 ? documentsEndRef : null}
                className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}
              >
                <div
                  className={`flex items-start gap-3 max-w-sm lg:max-w-md ${
                    isOwn ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-semibold text-xs">
                      {(isOwn ? self?.username : selectedUserToChat)
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </span>
                  </div>

                  {/* Document Card */}
                  <div
                    className={`p-4 rounded-2xl shadow-sm border ${
                      isOwn
                        ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white border-purple-300"
                        : "bg-white text-gray-800 border-purple-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${isOwn ? 'bg-white/20' : 'bg-purple-100'}`}>
                        <IoDocumentText size={20} className={isOwn ? 'text-white' : 'text-purple-600'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm truncate ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                          {doc.originalName}
                        </p>
                        <p className={`text-xs ${isOwn ? 'text-purple-100' : 'text-gray-500'}`}>
                          {formatFileSize(doc.fileSize)} • {doc.fileType}
                        </p>
                      </div>
                    </div>

                    {doc.description && (
                      <p className={`text-sm mb-3 ${isOwn ? 'text-purple-100' : 'text-gray-600'}`}>
                        {doc.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${isOwn ? 'text-purple-100' : 'text-gray-500'}`}>
                        {formatDate(doc.timestamp)}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `http://localhost:3000${doc.fileUrl}`;
                            link.download = doc.originalName;
                            link.click();
                          }}
                          className={`!p-1 !rounded-full !transition-colors ${
                            isOwn 
                              ? 'hover:!bg-white/20 !text-white' 
                              : 'hover:!bg-purple-100 !text-purple-600'
                          }`}
                        >
                          <MdDownload size={16} />
                        </button>
                        
                        {isOwn && (
                          <div className="flex items-center gap-1">
                            {doc.isSeen ? (
                              <BsCheckAll className="text-purple-200" size={12} />
                            ) : (
                              <BsCheck className="text-purple-200" size={12} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Interface */}
      <div className="bg-white/95 backdrop-blur-lg p-4 m-4 rounded-2xl border border-purple-200 shadow-lg">
        {selectedFiles.length > 0 ? (
          // File Preview and Upload
          <div className="space-y-4">
            {/* Selected Files */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Selected Files:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <IoDocumentText size={20} className="text-purple-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{file.name}</p>
                      <p className="text-gray-500 text-sm">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="!p-1 !rounded-full hover:!bg-purple-200 !transition-colors"
                    >
                      <MdClose size={16} className="text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Description Input */}
            <div>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description (optional)"
                className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 text-gray-800"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedFiles([]);
                  setDescription("");
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="!px-4 !py-2 !text-gray-600 hover:!bg-gray-100 !rounded-lg !transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={uploadDocuments}
                disabled={isUploading}
                className={`!px-6 !py-2 !rounded-lg !font-medium !transition-all !duration-200 !flex !items-center !gap-2 ${
                  isUploading
                    ? "!bg-gray-400 !text-white !cursor-not-allowed"
                    : "!bg-purple-500 hover:!bg-purple-600 !text-white"
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <IoCloudUpload size={16} />
                    Send Documents
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // File Drop Zone
          <div
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <MdAttachFile size={32} className="text-purple-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">
                  Drop files here or click to browse
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  PDF, DOC, TXT, and other document types supported
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.ppt,.pptx"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentBox;