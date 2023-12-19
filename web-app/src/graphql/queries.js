/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMessageInformation = /* GraphQL */ `
  query GetMessageInformation($id: ID!) {
    getMessageInformation(id: $id) {
      id
      Message
      Timestamp
    }
  }
`;
export const listMessageInformations = /* GraphQL */ `
  query ListMessageInformations(
    $filter: ModelMessageInformationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMessageInformations(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        Message
        Timestamp
      }
      nextToken
      __typename
    }
  }
`;
