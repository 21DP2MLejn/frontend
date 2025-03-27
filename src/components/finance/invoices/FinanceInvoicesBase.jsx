import React from 'react'
import { withTranslation } from 'react-i18next'
import { withRouter } from "react-router"
import { Link } from "react-router-dom"

import {
  Button,
  Container,
  Grid,
  Page
} from "tabler-react";

import SiteWrapper from '../../SiteWrapper'
import ButtonExport from '../../ui/ButtonExport';
import FinanceInvoicesFilter from "./FinanceInvoicesFilter"
import { useMutation } from "@apollo/client"
import { toast } from 'react-toastify'
import { SEND_INVOICE_REMINDERS } from "./queries"


function FinanceInvoicesBase ({ t, history, children, refetch, invoices }) {
  const [sendInvoiceReminders, { loading: sendingReminders }] = useMutation(SEND_INVOICE_REMINDERS)
  
  // Check if there are any overdue invoices that need reminders
  // Now using the isReminderEligible field from the backend
  const shouldShowRemindersButton = () => {
    if (!invoices || !invoices.edges || !invoices.edges.length) return false
    
    // Check if any invoice is eligible for a reminder
    return invoices.edges.some(({ node }) => node.isReminderEligible)
  }
  
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
        toast.success(
          t('finance.invoices.reminders_sent', 
            {count: result.count}
          )
        )
        // Refetch to update the UI
        refetch()
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
  return (
    <SiteWrapper>
      <div className="my-3 my-md-5">
        <Container>
          <Page.Header title={t("finance.title")}>
            <div className="page-options d-flex">
              {shouldShowRemindersButton() && (
                <Button
                  color="warning"
                  icon="bell"
                  className="mr-2"
                  onClick={handleSendReminders}
                  loading={sendingReminders}
                  disabled={sendingReminders}
                >
                  {t('finance.invoices.send_reminders')}
                </Button>
              )}
              <ButtonExport url="/finance/invoices/export" className='mr-2' />
              <Link to="/finance/invoices/groups">
                <Button
                  color="secondary"
                  icon="folder"
                >
                  {t('general.groups')}
                </Button>
              </Link>
            </div>
          </Page.Header>
          <Grid.Row>
            <Grid.Col md={12}>
              <FinanceInvoicesFilter refetch={refetch}/>
              {children}
            </Grid.Col>
          </Grid.Row>
          </Container>
      </div>
    </SiteWrapper>
  )
}

export default withTranslation()(withRouter(FinanceInvoicesBase))