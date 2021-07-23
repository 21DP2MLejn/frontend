// @flow

import React, { Component, useState } from 'react'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import { Query, Mutation } from "@apollo/client"
import { gql } from "@apollo/client"
import { v4 } from "uuid"
import { withTranslation } from 'react-i18next'
import { withRouter } from "react-router"
import { Link } from 'react-router-dom'
import moment from 'moment'

import {
  Alert,
  Page,
  Grid,
  Icon,
  Dimmer,
  Badge,
  Button,
  Card,
  Container,
  Table,
  StampCard
} from "tabler-react";
import SiteWrapper from "../../../../SiteWrapper"
import HasPermissionWrapper from "../../../../HasPermissionWrapper"
import { TimeStringToJSDateOBJ } from '../../../../../tools/date_tools'
// import { confirmAlert } from 'react-confirm-alert'; // Import
import { toast } from 'react-toastify'
import { class_edit_all_subtitle, represent_teacher_role } from "../../tools"
import confirm_delete from "../../../../../tools/confirm_delete"

import { class_subtitle, get_accounts_query_variables } from "../tools"

import ContentCard from "../../../../general/ContentCard"
import ScheduleClassBookBack from "./ScheduleClassBookBack"
import ScheduleClassBookClasspasses from "./ScheduleClassBookClasspasses"
import ScheduleClassBookSubscriptions from "./ScheduleClassBookSubscriptions"
import ScheduleClassBookPriceDropin from "./ScheduleClassBookPriceDropin"
import ScheduleClassBookPriceTrial from "./ScheduleClassBookPriceTrial"
// import ClassEditBase from "../ClassEditBase"

import { GET_BOOKING_OPTIONS_QUERY } from "./queries"
import CSLS from "../../../../../tools/cs_local_storage"


function ScheduleClassBook({ t, match, history }) {
  const [showSearch, setShowSearch] = useState(false)
  const return_url = "/schedule/classes/"
  const account_id = match.params.account_id
  const schedule_item_id = match.params.class_id
  const class_date = match.params.date
  const { loading: queryLoading, error: queryError, data: queryData } = useQuery(
    GET_BOOKING_OPTIONS_QUERY, {
      variables: {
        account: account_id,
        scheduleItem: schedule_item_id,
        date: class_date,
        listType: "ATTEND"
      }
    }
  )

  // Query
  // Loading
  if (queryLoading) return <p>{t('general.loading_with_dots')}</p>
  // Error
  if (queryError) {
    console.log(queryError)
    return <p>{t('general.error_sad_smiley')}</p>
  }
  
  console.log(queryData)
  const account = queryData.scheduleClassBookingOptions.account
  const classpasses = queryData.scheduleClassBookingOptions.classpasses
  const subscriptions = queryData.scheduleClassBookingOptions.subscriptions
  const prices = queryData.scheduleClassBookingOptions.scheduleItemPrices
  const scheduleItem = queryData.scheduleClassBookingOptions.scheduleItem
  const subtitle = class_subtitle({
    t: t,
    location: scheduleItem.organizationLocationRoom.organizationLocation.name, 
    locationRoom: scheduleItem.organizationLocationRoom.name,
    classtype: scheduleItem.organizationClasstype.name, 
    timeStart: TimeStringToJSDateOBJ(scheduleItem.timeStart), 
    date: class_date
  })

  console.log(prices)
  
  
  return (
    <SiteWrapper>
      <div className="my-3 my-md-5">
        <Container>
          <Page.Header title={t('schedule.title')} subTitle={subtitle}>
            <div className="page-options d-flex">   
              <ScheduleClassBookBack classId={schedule_item_id} date={class_date} />
            </div>
          </Page.Header>
          <Grid.Row>
              <Grid.Col md={12}>
                <h4>{t('general.booking_options')} {account.fullName}</h4>
                <div className="mt-6">
                <Grid.Row cards deck>
                  <ScheduleClassBookSubscriptions subscriptions={subscriptions} />
                  <ScheduleClassBookClasspasses classpasses={classpasses} />
                  {(prices) ?
                    (prices.organizationClasspassDropin) ? 
                      <ScheduleClassBookPriceDropin priceDropin={prices.organizationClasspassDropin}/> : "" 
                    : "" }
                  {(prices) ?
                    (prices.organizationClasspassTrial) ? 
                      <ScheduleClassBookPriceTrial priceTrial={prices.organizationClasspassTrial}/> : "" 
                    : "" }
                </Grid.Row>
                </div>
              </Grid.Col>
            </Grid.Row>
          </Container>
      </div>
    </SiteWrapper>
  )
}


export default withTranslation()(withRouter(ScheduleClassBook))

