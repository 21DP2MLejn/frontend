import React from 'react'
import { useMutation } from '@apollo/client'
import { withTranslation } from 'react-i18next'
import { withRouter } from "react-router"

import {
  Button,
} from "tabler-react";
import { toast } from 'react-toastify'

import { get_attendance_list_query_variables } from "../attendance/tools"
import { GET_SCHEDULE_CLASS_ATTENDANCE_QUERY } from "../attendance/queries"
import { CREATE_SCHEDULE_ITEM_ATTENDANCE } from "./queries"
import { getUrlFromReturnTo } from "./tools"


function ClasspassCheckinButton({t, match, history, classpass, returnTo, locationId=null}) {
  console.log(classpass)
  const account_id = match.params.account_id
  const schedule_item_id = match.params.class_id
  const class_date = match.params.date

  const createInput = {
    "account": account_id,
    "scheduleItem": schedule_item_id,
    "accountClasspass": classpass.accountClasspass.id,
    "date": class_date,
    "attendanceType": "CLASSPASS",
    "bookingStatus": "ATTENDING"
  }

  const [classCheckin, { loading, error }] = useMutation(CREATE_SCHEDULE_ITEM_ATTENDANCE)

  if (loading) {
    return "Please wait..."
  }

  if (error) {
    return "uh oh... error found"
  }

  const returnUrl = getUrlFromReturnTo({
    returnTo: returnTo,
    schedule_item_id: schedule_item_id,
    class_date: class_date,
    locationId: locationId
  })

  return (
    <Button 
      block 
      outline 
      color="success" 
      icon="check"
      onClick={() => classCheckin({
        variables: { "input": createInput }, 
        refetchQueries: [
          {query: GET_SCHEDULE_CLASS_ATTENDANCE_QUERY, variables: get_attendance_list_query_variables(schedule_item_id, class_date)},
        ]})
        .then(({ data }) => {
            console.log('got data', data);
            // redirect back to attendance list
            history.push(returnUrl)
            // show message to user
            toast.success((t('schedule.classes.class.book.toast_success')), {
              position: toast.POSITION.BOTTOM_RIGHT
            })
          }).catch((error) => {
            toast.error((t('general.toast_server_error')) +  error, {
                position: toast.POSITION.BOTTOM_RIGHT
              })
            console.log('there was an error sending the query', error)
          })}
    >
      {t("general.checkin")}
    </Button>
  )
}


export default withTranslation()(withRouter(ClasspassCheckinButton))

