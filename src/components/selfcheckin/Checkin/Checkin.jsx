import React, { useContext, useState } from 'react'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import { v4 } from "uuid"
import { withTranslation } from 'react-i18next'
import { withRouter } from "react-router"
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

import {
  Button,
  Dropdown,
  Icon,
  Table
} from "tabler-react";

import SelfCheckinBase from "../SelfCheckinBase"
import AppSettingsContext from '../../context/AppSettingsContext'
import HasPermissionWrapper from "../../HasPermissionWrapper"
import { GET_ACCOUNTS_QUERY, GET_SCHEDULE_CLASS_ATTENDANCE_QUERY, UPDATE_SCHEDULE_ITEM_ATTENDANCE } from "./queries"
import { get_attendance_list_query_variables, get_accounts_query_variables, getSubtitle } from "./tools"
import CSLS from "../../../tools/cs_local_storage"
import BadgeBookingStatus from "../../ui/BadgeBookingStatus"
import ContentCard from "../../general/ContentCard"
import InputSearch from "../../general/InputSearch"


function setAttendanceStatus({t, updateAttendance, node, status}) {
  updateAttendance({
    variables: { 
      input: {
        id: node.id, 
        bookingStatus: status
      }
    }
  }).then(({ data }) => {
    console.log('got data', data);
    toast.success(
      t('schedule.classes.class.attendance.status_saved'), {
        position: toast.POSITION.BOTTOM_RIGHT
      })
  }).catch((error) => {
    toast.error((t('general.toast_server_error')) +  error, {
        position: toast.POSITION.BOTTOM_RIGHT
      })
    console.log('there was an error sending the query', error);
  })
}


function SelfCheckinCheckin({ t, match, history }) {
  const [showSearch, setShowSearch] = useState(false)
  const locationId = match.params.location_id
  const scheduleItemId = match.params.class_id
  const class_date = match.params.date
  const appSettings = useContext(AppSettingsContext)
  const dateFormat = appSettings.dateFormat
  const timeFormat = appSettings.timeFormatMoment
  const dateTimeFormat = dateFormat + " " + timeFormat

  const { 
    refetch: refetchAttendance, 
    loading: queryAttendanceLoading, 
    error: queryAttendanceError, 
    data: queryAttendanceData 
  } = useQuery(
    GET_SCHEDULE_CLASS_ATTENDANCE_QUERY, {
      variables: get_attendance_list_query_variables(scheduleItemId, class_date)
    }
  )

  const [ updateAttendance ] = useMutation(UPDATE_SCHEDULE_ITEM_ATTENDANCE)

  const [ getAccounts, 
    { fetchMore: fetchMoreAccounts,
      loading: queryAccountsLoading, 
      error: queryAccountsError, 
      data: queryAccountsData 
    }] = useLazyQuery( GET_ACCOUNTS_QUERY )

  console.log('queryAccountsData')
  console.log(queryAccountsData)

  if (queryAttendanceLoading) return (
    <SelfCheckinBase>
      {t("general.loading_with_dots")}
    </SelfCheckinBase>
  )
  if (queryAttendanceError) return (
    <SelfCheckinBase>
      {t("selfcheckin.checkin.error_loading")}
    </SelfCheckinBase>
  )

  console.log(queryAttendanceData)
  let checkedInIds = []
  queryAttendanceData.scheduleItemAttendances.edges.map(({ node }) => (
    checkedInIds.push(node.account.id)
  ))
  console.log(checkedInIds)
  const scheduleItem = queryAttendanceData.scheduleItem

  const subTitle = getSubtitle(
    class_date,
    scheduleItem,
    dateTimeFormat
  )

  return (
    <SelfCheckinBase title={t("selfcheckin.classes.title")} subTitle={subTitle}>
      <ContentCard cardTitle={t('general.attendance')}
                    pageInfo={queryAttendanceData.scheduleItemAttendances.pageInfo}
                    onLoadMore={() => {
                      fetchMoreAccounts({
                      variables: {
                        after: queryAttendanceData.scheduleItemAttendances.pageInfo.endCursor
                      },
                      updateQuery: (previousResult, { fetchMoreResult }) => {
                        const newEdges = fetchMoreResult.scheduleItemAttendances.edges
                        const pageInfo = fetchMoreResult.scheduleItemAttendances.pageInfo 

                        return newEdges.length
                          ? {
                              // Put the new scheduleItemAttendances at the end of the list and update `pageInfo`
                              // so we have the new `endCursor` and `hasNextPage` values
                              queryAttendanceData: {
                                scheduleItemAttendances: {
                                  __typename: previousResult.scheduleItemAttendances.__typename,
                                  edges: [ ...previousResult.scheduleItemAttendances.edges, ...newEdges ],
                                  pageInfo
                                }
                              }
                            }
                          : previousResult
                      }
                    })
        }} >
          <Table>
            <Table.Header>
              <Table.Row key={v4()}>
                <Table.ColHeader>{t('general.name')}</Table.ColHeader>
                <Table.ColHeader>{t('general.booking_status')}</Table.ColHeader>
                <Table.ColHeader></Table.ColHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {queryAttendanceData.scheduleItemAttendances.edges.map(({ node }) => (
                  <Table.Row key={v4()}>
                    <Table.Col>
                      {node.account.fullName}
                    </Table.Col>
                    <Table.Col>
                      <BadgeBookingStatus status={node.bookingStatus} />
                    </Table.Col>
                    <Table.Col>
                      {/* Delete */}
                      {/* <ScheduleClassAttendanceDelete node={node} /> */}
                      {/* Status dropdown */}
                      <Dropdown
                        key={v4()}
                        className="pull-right"
                        type="button"
                        toggle
                        color="secondary"
                        triggerContent={t("general.status")}
                        items={[
                          <HasPermissionWrapper key={v4()} permission="change" resource="scheduleitemattendance">
                            <Dropdown.Item
                              key={v4()}
                              icon="check"
                              onClick={() => {
                                setAttendanceStatus({
                                  t: t, 
                                  updateAttendance: updateAttendance,
                                  node: node,
                                  status: 'ATTENDING'
                                })
                                refetchAttendance()
                              }}>
                                {t('schedule.classes.class.attendance.booking_status.ATTENDING')}
                            </Dropdown.Item>
                          </HasPermissionWrapper>,
                          <HasPermissionWrapper key={v4()} permission="change" resource="scheduleitemattendance">
                            <Dropdown.Item
                              key={v4()}
                              icon="calendar"
                              onClick={() => {
                                setAttendanceStatus({
                                  t: t, 
                                  updateAttendance: updateAttendance,
                                  node: node,
                                  status: 'BOOKED'
                                })
                                refetchAttendance()
                              }}>
                                {t('schedule.classes.class.attendance.booking_status.BOOKED')}
                            </Dropdown.Item>
                          </HasPermissionWrapper>,
                          <HasPermissionWrapper key={v4()} permission="change" resource="scheduleitemattendance">
                            <Dropdown.Item
                              key={v4()}
                              icon="x"
                              onClick={() => {
                                setAttendanceStatus({
                                  t: t, 
                                  updateAttendance: updateAttendance,
                                  node: node,
                                  status: 'CANCELLED'
                                })
                                refetchAttendance()
                              }}>
                                {t('schedule.classes.class.attendance.booking_status.CANCELLED')}
                            </Dropdown.Item>
                          </HasPermissionWrapper>,
                        ]}
                      />
                      {(node.bookingStatus === "BOOKED") ?
                        <HasPermissionWrapper key={v4()} permission="change" resource="scheduleitemattendance">
                          <Button
                            key={v4()}
                            className="pull-right"
                            color="success"
                            size=""
                            onClick={() => {
                              setAttendanceStatus({
                                t: t, 
                                updateAttendance: updateAttendance,
                                node: node,
                                status: 'ATTENDING'
                              })
                              refetchAttendance()
                            }}>
                              {t('general.checkin')}
                          </Button>
                        </HasPermissionWrapper>  : "" }
                    </Table.Col>
                  </Table.Row>
                ))}
            </Table.Body>
          </Table>
      </ContentCard>
      <h3>{t("selfcheckin.checkin.title_not_on_list")}</h3>
      <InputSearch 
        initialValueKey={CSLS.SELFCHECKIN_CHECKIN_SEARCH}
        placeholder={t("search")}
        onChange={(value) => {
          console.log(value)
          localStorage.setItem(CSLS.SELFCHECKIN_CHECKIN_SEARCH, value)
          if (value) {
            // {console.log('showSearch')}
            // {console.log(showSearch)}
            setShowSearch(true)
            getAccounts({ variables: get_accounts_query_variables()})
          } else {
            setShowSearch(false)
          }
        }}
      /> <br />
      {/* Search results */}
      {(showSearch && (queryAccountsData) && (!queryAccountsLoading) && (!queryAccountsError)) ?
        <ContentCard cardTitle={t('general.search_results')}
                    pageInfo={queryAccountsData.accounts.pageInfo}
                    onLoadMore={() => {
                      fetchMoreAccounts({
                        variables: {
                        after: queryAccountsData.accounts.pageInfo.endCursor
                      },
                      updateQuery: (previousResult, { fetchMoreResult }) => {
                        const newEdges = fetchMoreResult.accounts.edges
                        const pageInfo = fetchMoreResult.accounts.pageInfo 

                        return newEdges.length
                          ? {
                              // Put the new accounts at the end of the list and update `pageInfo`
                              // so we have the new `endCursor` and `hasNextPage` values
                              queryAccountsData: {
                                accounts: {
                                  __typename: previousResult.accounts.__typename,
                                  edges: [ ...previousResult.accounts.edges, ...newEdges ],
                                  pageInfo
                                }
                              }
                            }
                          : previousResult
                      }
                    })
                  }} >
          { (!queryAccountsData.accounts.edges.length) ? 
            t('schedule.classes.class.attendance.search_result_empty') : 
            <Table>
              <Table.Header>
                <Table.Row key={v4()}>
                  <Table.ColHeader>{t('general.name')}</Table.ColHeader>
                  <Table.ColHeader>{t('general.email')}</Table.ColHeader>
                  <Table.ColHeader></Table.ColHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {queryAccountsData.accounts.edges.map(({ node }) => (
                  <Table.Row key={v4()}>
                    <Table.Col key={v4()}>
                      {node.fullName}
                    </Table.Col>
                    <Table.Col key={v4()}>
                      {node.email}
                    </Table.Col>
                    <Table.Col key={v4()}>
                      {(checkedInIds.includes(node.id)) ? 
                        <span className="pull-right">{t("schedule.classes.class.attendance.search_results_already_checked_in")}</span> :
                        <Link to={"/selfcheckin/book/" + locationId + "/" + scheduleItemId + "/" + class_date + "/" + node.id}>
                          <Button color="secondary pull-right">
                            {t('general.checkin')} <Icon name="chevron-right" />
                          </Button>
                        </Link>       
                      }   
                    </Table.Col>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          }
        </ContentCard>
        : ""
      }
    </SelfCheckinBase>
  )
}


export default withTranslation()(withRouter(SelfCheckinCheckin))

