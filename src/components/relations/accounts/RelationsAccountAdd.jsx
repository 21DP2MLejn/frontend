// @flow

import React from 'react'
import { useMutation } from "@apollo/client";
import { withTranslation } from 'react-i18next'
import { withRouter } from "react-router"
import { Formik, Form as FoForm, Field, ErrorMessage } from 'formik'
import { toast } from 'react-toastify'

import { GET_ACCOUNTS_QUERY, ADD_ACCOUNT } from './queries'
import { ACCOUNT_SCHEMA } from './yupSchema'

import {
  Page,
  Grid,
  Icon,
  Button,
  Card,
  Container,
  Form,
} from "tabler-react"
import SiteWrapper from "../../SiteWrapper"
import HasPermissionWrapper from "../../HasPermissionWrapper"

import { get_list_query_variables } from "./tools"
import RelationsAccountForm from "./RelationsAccountForm"
import RelationsMenu from '../RelationsMenu'

const returnUrl = "/relations/accounts"

function RelationsAccountAdd({t, history}) {
  const [addAccount] = useMutation(ADD_ACCOUNT)

  return (
    <SiteWrapper>
      <div className="my-3 my-md-5">
        <Container>
          <Page.Header title={t('relations.title')} />
          <Grid.Row>
            <Grid.Col md={9}>
            <Card>
              <Card.Header>
                <Card.Title>{t('relations.accounts.title_add')}</Card.Title>
              </Card.Header>
                <Formik
                    initialValues={{ name: '', code: '' }}
                    validationSchema={ACCOUNT_SCHEMA}
                    onSubmit={(values, { setSubmitting }) => {
                        addAccount({ variables: {
                          input: {
                            firstName: values.firstName,
                            lastName: values.lastName,
                            email: values.email
                          }
                        }, refetchQueries: [
                            {query: GET_ACCOUNTS_QUERY, variables: get_list_query_variables()}
                        ]})
                        .then(({ data }) => {
                            console.log('got data', data);
                            const accountId = data.createAccount.account.id
                            history.push(`/relations/accounts/${accountId}/profile`)
                            toast.success((t('relations.accounts.toast_add_success')), {
                                position: toast.POSITION.BOTTOM_RIGHT
                              })
                          }).catch((error) => {
                            toast.error((t('general.toast_server_error')) + ': ' +  error, {
                                position: toast.POSITION.BOTTOM_RIGHT
                              })
                            console.log('there was an error sending the query', error)
                            setSubmitting(false)
                          })
                    }}
                    >
                    {({ isSubmitting, errors }) => (
                        <RelationsAccountForm
                          isSubmitting={isSubmitting}
                          errors={errors}
                          returnUrl={returnUrl}
                        />
                    )}
                </Formik>
            </Card>
            </Grid.Col>
            <Grid.Col md={3}>
              <HasPermissionWrapper permission="add"
                                    resource="account">
                <Button color="primary btn-block mb-6"
                        onClick={() => history.push(returnUrl)}>
                  <Icon prefix="fe" name="chevrons-left" /> {t('general.back')}
                </Button>
              </HasPermissionWrapper>
              <RelationsMenu activeLink='accounts'/>
            </Grid.Col>
          </Grid.Row>
        </Container>
      </div>
    </SiteWrapper>
  )
}

export default withTranslation()(withRouter(RelationsAccountAdd))