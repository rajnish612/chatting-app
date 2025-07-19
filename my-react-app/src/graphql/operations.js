import { gql } from '@apollo/client';

// Queries
export const GET_BLOCKED_USERS = gql`
  query GetBlockedUsers {
    getBlockedUsers {
      _id
      username
      email
    }
  }
`;

export const SELF_QUERY = gql`
  query {
    self {
      _id
      email
      username
      followings {
        _id
        username
        email
      }
      followers {
        _id
        username
        email
      }
      blockedUsers {
        _id
        username
        email
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