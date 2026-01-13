import { gql } from "@apollo/client";

export const GET_ME = gql`
  query GetMe {
    me {
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

export const GET_PERSON = gql`
  query GetPerson($id: String!) {
    person(id: $id) {
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

export const GET_PEOPLE = gql`
  query GetPeople($tags: [String!]) {
    people(tags: $tags) {
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

export const GET_GRAPH = gql`
  query GetGraph($depth: Int) {
    graph(depth: $depth) {
      nodes {
        id
        name
        tags
        isUser
        degree
      }
      edges {
        id
        source
        target
        trustLevel
        context
      }
    }
  }
`;
