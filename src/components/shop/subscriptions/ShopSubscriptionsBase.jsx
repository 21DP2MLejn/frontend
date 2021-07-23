// @flow

import React, {Component } from 'react'
import { withTranslation } from 'react-i18next'
import { withRouter } from "react-router"
import { useQuery } from '@apollo/client'
import { Link } from 'react-router-dom'

import {
  Icon,
  List
} from "tabler-react";
import ShopBase from "../ShopBase"

function ShopSubscriptionsBase({ t, match, history, children }) {
  
  return (
    <ShopBase title={t("shop.title")}>
      <h4>{t("shop.subscriptions.title")}</h4>
        {children}
    </ShopBase>
  )
}


export default withTranslation()(withRouter(ShopSubscriptionsBase))