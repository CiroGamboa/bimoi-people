import { gql } from "@apollo/client";

export const CREATE_PERSON = gql`
  mutation CreatePerson($input: PersonInput!) {
    createPerson(input: $input) {
      id
      name
      bio
      tags
      offers
      seeks
      isUser
      createdAt
    }
  }
`;

export const UPDATE_PERSON = gql`
  mutation UpdatePerson($id: String!, $input: PersonInput!) {
    updatePerson(id: $id, input: $input) {
      id
      name
      bio
      tags
      offers
      seeks
      isUser
      createdAt
    }
  }
`;

export const DELETE_PERSON = gql`
  mutation DeletePerson($id: String!) {
    deletePerson(id: $id)
  }
`;

export const SET_AS_ME = gql`
  mutation SetAsMe($id: String!) {
    setAsMe(id: $id) {
      id
      name
      isUser
    }
  }
`;

export const CREATE_CONNECTION = gql`
  mutation CreateConnection(
    $fromId: String!
    $toId: String!
    $input: ConnectionInput!
  ) {
    createConnection(fromId: $fromId, toId: $toId, input: $input) {
      relationshipId
      person {
        id
        name
      }
      trustLevel
      context
      notes
      since
    }
  }
`;

export const UPDATE_CONNECTION = gql`
  mutation UpdateConnection($relationshipId: String!, $input: ConnectionInput!) {
    updateConnection(relationshipId: $relationshipId, input: $input) {
      relationshipId
      person {
        id
        name
      }
      trustLevel
      context
      notes
      since
    }
  }
`;

export const DELETE_CONNECTION = gql`
  mutation DeleteConnection($relationshipId: String!) {
    deleteConnection(relationshipId: $relationshipId)
  }
`;
