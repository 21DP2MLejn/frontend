import { gql } from "@apollo/client"

export const GET_LOCATION_ROOMS_QUERY = gql`
  query OrganizationLocationRooms($after: String, $before: String, $organizationLocation: ID!, $archived: Boolean!) {
    organizationLocationRooms(first: 15, before: $before, after: $after, organizationLocation: $organizationLocation, archived: $archived) {
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      edges {
        node {
          id
          organizationLocation {
            id
            name
          }
          archived,
          displayPublic
          name
        }
      }
    }
    organizationLocation(id: $organizationLocation) {
      id
      name
    }
  }
`

export const GET_LOCATION_ROOM_QUERY = gql`
  query OrganizationLocationRoom($id: ID!) {
    organizationLocationRoom(id:$id) {
      id
      organizationLocation {
        id
        name
      }
      name
      displayPublic
      archived
    }
  }
`

export const ADD_LOCATION_ROOM = gql`
  mutation CreateOrganizationLocationRoom($input: CreateOrganizationLocationRoomInput!) {
    createOrganizationLocationRoom(input: $input) {
      organizationLocationRoom {
        id
        organizationLocation {
          id
          name
        }
        archived
        displayPublic
        name
      }
    }
  }
`

export const ARCHIVE_LOCATION_ROOM = gql`
mutation ArchiveOrganizationLocationRoom($input: ArchiveOrganizationLocationRoomInput!) {
  archiveOrganizationLocationRoom(input: $input) {
    organizationLocationRoom {
      id
      archived
    }
  }
}
`