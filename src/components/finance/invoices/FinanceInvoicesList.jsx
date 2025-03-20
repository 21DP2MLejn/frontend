import React, { useContext, useState } from 'react'
import { useMutation } from "@apollo/client"
import { v4 } from "uuid"
import { withTranslation } from 'react-i18next'
import { withRouter } from "react-router"
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

import {
  Icon,
  Button,
  Table, 
  Text
} from "tabler-react";

import AppSettingsContext from '../../context/AppSettingsContext'
import { get_list_query_variables } from "./tools"
import FinanceInvoicesStatus from "../../ui/FinanceInvoiceStatus"
import { GET_INVOICES_QUERY, DELETE_FINANCE_INVOICE, SEND_INVOICE_REMINDERS, SEND_INVOICE_REMINDER } from "./queries"
import { TOKEN_REFRESH } from "../../../queries/system/auth"
import { refreshTokenAndOpenExportLinkInNewTab } from "../../../tools/refresh_token_and_open_export_link"
import confirm_delete from "../../../tools/confirm_delete"
import moment from 'moment'

function FinanceInvoicesList({
  t, 
  history, 
  match, 
  invoices, 
  showBtnPDF=false,
  showColRelation=false,
}) {
  const appSettings = useContext(AppSettingsContext)
  const dateFormat = appSettings.dateFormat

  const [doTokenRefresh] = useMutation(TOKEN_REFRESH)
  const [deleteFinanceInvoice] = useMutation(DELETE_FINANCE_INVOICE)
  const [sendInvoiceReminders, { loading: sendingReminders }] = useMutation(SEND_INVOICE_REMINDERS)
  const [sendInvoiceReminder] = useMutation(SEND_INVOICE_REMINDER)
  const [remindersSent, setRemindersSent] = useState(false)
  const [reminderSendingInvoiceIds, setReminderSendingInvoiceIds] = useState([])
  const [reminderSentInvoiceIds, setReminderSentInvoiceIds] = useState([])

  // Check if there are any overdue invoices
  const hasOverdueInvoices = invoices.edges.some(({ node }) => 
    node.status === "OVERDUE"
  )

  // Function to send reminders for overdue invoices
  const handleSendReminders = () => {
    // Show loading toast
    const loadingToastId = toast.info(t('general.please_wait'), { autoClose: false })
    
    sendInvoiceReminders()
    .then(({ data }) => {
      // Close loading toast
      toast.dismiss(loadingToastId)
      
      const result = data.sendInvoiceReminders.result;
      if (result.success) {
        setRemindersSent(true)
        toast.success(
          t('finance.invoices.reminders_sent', 
            {count: result.count}
          )
        )
      } else {
        // Show specific error message from backend
        if (result.message && result.message.includes('Mollie API')) {
          // This is a Mollie API error - show with a different style and more details
          toast.error(
            <div>
              <strong>{t('finance.invoices.mollie_api_error')}:</strong>
              <p>{result.message}</p>
              <p>{t('finance.invoices.check_api_key_settings')}</p>
            </div>,
            { autoClose: 10000 } // Keep it visible longer
          )
        } else {
          // Regular error
          toast.error(result.message || t('general.error_sending_reminders'))
        }
      }
    })
    .catch((error) => {
      // Close loading toast
      toast.dismiss(loadingToastId)
      
      // Log detailed error information
      console.error("Error sending reminders:", error)
      
      // Show more specific error message if available
      const errorMessage = error.message || t('general.error_sending_reminders')
      toast.error(errorMessage)
    })
  }

  // Function to send a reminder for a specific invoice
  const handleSendReminderForInvoice = (invoiceId) => {
    // Add this invoice to the list of invoices that are currently sending reminders
    setReminderSendingInvoiceIds(prev => [...prev, invoiceId])
    
    // Send reminder for this specific invoice
    sendInvoiceReminder({
      variables: {
        id: invoiceId,
        attachPDF: false // Don't attach PDF to the email, use link instead
      }
    })
    .then(({ data }) => {
      // Remove this invoice from the sending list
      setReminderSendingInvoiceIds(prev => prev.filter(id => id !== invoiceId))
      
      const result = data.sendInvoiceReminder.result;
      if (result.success) {
        // Add this invoice to the list of invoices that have been sent reminders
        setReminderSentInvoiceIds(prev => [...prev, invoiceId])
        toast.success(t('finance.invoices.reminder_sent'))
      } else {
        // Show specific error message from backend with appropriate styling
        if (result.message && result.message.includes('Mollie API')) {
          // This is a Mollie API error - show with a different style and more details
          toast.error(
            <div>
              <strong>{t('finance.invoices.mollie_api_error')}:</strong>
              <p>{result.message}</p>
              <p>{t('finance.invoices.check_api_key_settings')}</p>
            </div>,
            { autoClose: 10000 } // Keep it visible longer
          )
        } else {
          // Regular error
          toast.error(result.message || t('general.error_sending_reminder'))
        }
      }
    })
    .catch((error) => {
      // Remove this invoice from the sending list
      setReminderSendingInvoiceIds(prev => prev.filter(id => id !== invoiceId))
      
      // Log detailed error information
      console.error("Error sending reminder:", error)
      
      // Show more specific error message if available
      const errorMessage = error.message || t('general.error_sending_reminder')
      toast.error(errorMessage)
    })
  }

  return (
    <>
      {/* Bulk reminder button temporarily disabled
       {hasOverdueInvoices && !remindersSent && (
        <div className="mb-3">
          <Button
            color="warning"
            icon="bell"
            onClick={handleSendReminders}
            loading={sendingReminders}
            disabled={sendingReminders}
          >
            {t('finance.invoices.send_reminders')}
          </Button>
        </div>
      )}
      */}
      <Table cards>
        <Table.Header>
          <Table.Row key={v4()}>
            <Table.ColHeader>{t('general.status')}</Table.ColHeader>
            <Table.ColHeader>{t('finance.invoices.invoice_number')} & {t('finance.invoices.summary')}</Table.ColHeader>
            {showColRelation && <Table.ColHeader>{t('finance.invoices.relation')}</Table.ColHeader>}
            <Table.ColHeader>{t('finance.invoices.date')} & {t('finance.invoices.due')}</Table.ColHeader>
            {/* <Table.ColHeader>{t('finance.invoices.due')}</Table.ColHeader> */}
            <Table.ColHeader>{t('general.total')}</Table.ColHeader>
            <Table.ColHeader>{t('general.balance')}</Table.ColHeader>
            <Table.ColHeader></Table.ColHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {invoices.edges.map(({ node }) => (
            <Table.Row key={v4()}>
              <Table.Col key={v4()}>
                <FinanceInvoicesStatus status={node.status} /> <br />
                {(node.business && !showColRelation) && 
                  <Link to={"/relations/b2b/" + node.business.id + "/edit"}>
                    <small><Icon name="home" /> {node.business.name}</small>
                  </Link>
                }
              </Table.Col>
              <Table.Col key={v4()}>
                <Link to={"/finance/invoices/edit/" + node.id}>
                  {node.invoiceNumber}
                </Link><br />
                <Text.Small color="gray">{node.summary.trunc(28)}</Text.Small>
              </Table.Col>
              {showColRelation &&
                <Table.Col key={v4()}>
                  { node.account && 
                    <Link to={"/relations/accounts/" + node.account.id + "/profile"}>
                      <Icon name="user" /> {node.account.fullName} <br />
                    </Link> 
                  }
                  { node.business && 
                    <Link to={"/relations/b2b/" + node.business.id + "/edit"}>
                      <small><Icon name="home" /> {node.business.name}</small>
                    </Link>
                  }
                </Table.Col>
              }
              <Table.Col key={v4()}>
                {moment(node.dateSent).format(dateFormat)} <br />
                {moment(node.dateDue).format(dateFormat)}
              </Table.Col>
              <Table.Col key={v4()}>
                {node.totalDisplay}
              </Table.Col>
              <Table.Col key={v4()}>
                {node.balanceDisplay}
              </Table.Col>
              <Table.Col className="text-right" key={v4()}>
                {/* Add individual reminder button for overdue invoices */}
                {node.status === "OVERDUE" && 
                  !reminderSentInvoiceIds.includes(node.id) && (
                  <Button
                    color="warning"
                    icon="bell"
                    className="mr-2"
                    size="sm"
                    onClick={() => handleSendReminderForInvoice(node.id)}
                    loading={reminderSendingInvoiceIds.includes(node.id)}
                    disabled={reminderSendingInvoiceIds.includes(node.id)}
                  >
                    {t('finance.invoices.send_reminder')}
                  </Button>
                )}
                {(showBtnPDF) && <Button
                  color="secondary"
                  icon="printer"
                  className="mr-2"
                  size="sm"
                  onClick={() => refreshTokenAndOpenExportLinkInNewTab(
                    t, doTokenRefresh, history, `/d/export/invoice/pdf/${node.id}`
                  )}
                >
                  {t('general.pdf')} 
                </Button>}
                <Link to={"/finance/invoices/edit/" + node.id}>
                  <Button className='btn-sm' 
                          color="secondary">
                    {t('general.edit')}
                  </Button>
                </Link>
                <button className="icon btn btn-link btn-sm" 
                  title={t('general.delete')} 
                  href=""
                  onClick={() => {
                    confirm_delete({
                      t: t,
                      msgConfirm: t("finance.invoices.delete_confirm_msg"),
                      msgDescription: <p>{node.invoiceNumber}</p>,
                      msgSuccess: t('finance.invoices.deleted'),
                      deleteFunction: deleteFinanceInvoice,
                      functionVariables: { 
                        variables: {
                          input: {
                            id: node.id
                          }
                        }, 
                        refetchQueries: [
                          {query: GET_INVOICES_QUERY, variables: get_list_query_variables() } 
                        ]
                      }
                    })
                }}>
                  <span className="text-red"><Icon prefix="fe" name="trash-2" /></span>
                </button>
            </Table.Col>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  </>)
}

export default withTranslation()(withRouter(FinanceInvoicesList))