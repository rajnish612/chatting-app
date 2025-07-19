import { gql } from '@apollo/client';

// Queries
export const GET_BLOCKED_USERS = gql`
  query GetBlockedUsers {
    getBlockedUsers {
      _id
      username
      email
      name
      bio
    }
  }
`;

export const SELF_QUERY = gql`
  query {
    self {
      _id
      email
      username
      name
      bio
      followings {
        _id
        username
        email
        name
        bio
      }
      followers {
        _id
        username
        email
        name
        bio
      }
      blockedUsers {
        _id
        username
        email
        name
        bio
      }
    }
  }
`;

// Mutations
export const UNBLOCK_USER = gql`
  mutation UnblockUser($userId: ID!) {
    unblockUser(userId: $userId)
  }
`;

export const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($currentPassword: String!, $newPassword: String!) {
    updatePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String, $bio: String) {
    updateProfile(name: $name, bio: $bio)
  }
`;

export const DEACTIVATE_ACCOUNT = gql`
  mutation DeactivateAccount($password: String!) {
    deactivateAccount(password: $password)
  }
`;

export const BLOCK_USER = gql`
  mutation BlockUser($selfId: ID!, $username: String!) {
    blockUser(selfId: $selfId, username: $username)
  }
`;

export const SEND_PASSWORD_RESET_OTP = gql`
  mutation SendPasswordResetOTP($email: String!) {
    sendPasswordResetOTP(email: $email)
  }
`;

export const RESET_PASSWORD_WITH_OTP = gql`
  mutation ResetPasswordWithOTP($email: String!, $otp: String!, $newPassword: String!) {
    resetPasswordWithOTP(email: $email, otp: $otp, newPassword: $newPassword)
  }
`;

export const SEND_EMAIL_CHANGE_OTP = gql`
  mutation SendEmailChangeOTP($password: String!, $newEmail: String!) {
    sendEmailChangeOTP(password: $password, newEmail: $newEmail)
  }
`;

export const VERIFY_EMAIL_CHANGE_OTP = gql`
  mutation VerifyEmailChangeOTP($otp: String!) {
    verifyEmailChangeOTP(otp: $otp)
  }
`;

export const SEND_PASSWORD_CHANGE_OTP = gql`
  mutation SendPasswordChangeOTP {
    sendPasswordChangeOTP
  }
`;

export const CHANGE_PASSWORD_WITH_OTP = gql`
  mutation ChangePasswordWithOTP($otp: String!, $newPassword: String!) {
    changePasswordWithOTP(otp: $otp, newPassword: $newPassword)
  }
`;