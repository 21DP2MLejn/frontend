import { gql } from "@apollo/client"

export const GET_COSTCENTERS_QUERY = gql`
  query FinanceCostCenters($after: String, $before: String, $archived: Boolean) {
    financeCostcenters(first: 15, before: $before, after: $after, archived: $archived) {
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      edges {
        node {
          id,
          archived,
          name,
          code
        }
      }
    }
  }
`

export const GET_COSTCENTER_QUERY = gql`
  query FinanceCostcenter($id: ID!) {
    financeCostcenter(id:$id) {
      id
      name
      code
      archived
    }
  }
`

export const ARCHIVE_COSTCENTER = gql`
mutation ArchiveFinanceCostCenter($input: ArchiveFinanceCostCenterInput!) {
  archiveFinanceCostcenter(input: $input) {
    financeCostcenter {
      id
      archived
    }
  }
}
`