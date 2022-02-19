import React from 'react'
import { useMutation } from '@apollo/client'
import { withTranslation } from 'react-i18next'
import { withRouter } from "react-router"
import { Formik } from 'formik'
import { toast } from 'react-toastify'
import {
  Card,
} from "tabler-react";

import { CREATE_ACCOUNT_BANK_ACCOUNT_MANDATE } from './queries'
import { GET_ACCOUNT_BANK_ACCOUNTS_QUERY } from '../queries'
import RelationsAccountBankAccountMandateForm from './RelationsAccountBankAccountMandateForm'
import { dateToLocalISO } from '../../../../../tools/date_tools'
import RelationsAccountBankAccountBase from '../RelationsAccountBankAccountBase'


function RelationsAccountBankAccountMandateAdd({ t, match, history }) {
  const accountId = match.params.account_id
  const bankAccountId = match.params.bank_account_id
  const returnUrl = `/relations/accounts/${accountId}/bank_accounts`

  const [createAccountBankAccountMandate] = useMutation(CREATE_ACCOUNT_BANK_ACCOUNT_MANDATE) 
 
  return (
    <RelationsAccountBankAccountBase showEditBack={true}>
      <Card>
        <Card.Header>
          <Card.Title>{t('relations.account.bank_accounts.mandates.title_add')}</Card.Title>
        </Card.Header>
        <Formik
          initialValues={{
            reference: "",
            content: "",
            signatureDate: new Date()
          }}
          // validationSchema={INVOICE_GROUP_SCHEMA}
          onSubmit={(values, { setSubmitting }) => {
            console.log('submit values:')
            console.log(values)

            createAccountBankAccountMandate({ variables: {
              input: {
                accountBankAccount: bankAccountId,
                reference: values.refrence, 
                content: values.content,
                signatureDate: dateToLocalISO(values.signatureDate)
              }
            }, refetchQueries: [
              {query: GET_ACCOUNT_BANK_ACCOUNTS_QUERY, variables: { account: accountId }}
            ]})
            .then(({ data }) => {
                console.log('got data', data)
                history.push(returnUrl)
                toast.success((t('relations.account.bank_accounts.mandates.toast_add_success')), {
                    position: toast.POSITION.BOTTOM_RIGHT
                  })
                setSubmitting(false)
              }).catch((error) => {
                toast.error((t('general.toast_server_error')) +  error, {
                    position: toast.POSITION.BOTTOM_RIGHT
                  })
                console.log('there was an error sending the query', error)
                setSubmitting(false)
              })
            }}
        >
          {({ isSubmitting, errors, values, submitForm, setFieldTouched, setFieldValue }) => (
            <RelationsAccountBankAccountMandateForm
              isSubmitting={isSubmitting}
              errors={errors}
              values={values}
              submitForm={submitForm}
              setFieldTouched={setFieldTouched}
              setFieldValue={setFieldValue}
              returnUrl={returnUrl}
            >
            </RelationsAccountBankAccountMandateForm>   
          )}
        </Formik>
      </Card>
    </RelationsAccountBankAccountBase>
  )
}


export default withTranslation()(withRouter(RelationsAccountBankAccountMandateAdd))
