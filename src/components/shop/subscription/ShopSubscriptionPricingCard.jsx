// @flow

import React, {Component } from 'react'
import { withTranslation } from 'react-i18next'
import { withRouter } from "react-router"
import { useQuery } from '@apollo/client'
import { Link } from 'react-router-dom'

import {
  Grid,
  Icon,
  List,
  PricingCard
} from "tabler-react";

// Example:
// https://github.com/tabler/tabler-react/blob/master/example/src/interface/PricingCardsPage.react.js


function ShopClasspassPricingCard({ t, subscription, btnLink, active=false, displayCheckoutInfo=false }) {
  // classpass should be an object with at least the following values from an organizationClasspass object:
  // id, name, priceDisplay, unlimited, classes, validity, link
  return (
    <PricingCard active={active}>
      <PricingCard.Category>
        {subscription.name}
      </PricingCard.Category>
      <PricingCard.Price>
        {subscription.priceTodayDisplay}
      </PricingCard.Price>
      <PricingCard.AttributeList>
        <PricingCard.AttributeItem>
          {/* {((subscription.classes != 1) || (subscription.unlimited))? t('general.classes'): t('general.class')} / {t('general.month')} { ": " } */}
          {t('general.classes')} / {t('general.month')} { ": " }
          <b>{(subscription.unlimited) ? t('general.unlimited') : subscription.classes }</b> 
        </PricingCard.AttributeItem>
        <PricingCard.AttributeItem>
          {t('general.min_duration')} { ": " }
          <b>{subscription.minDuration} {(subscription.minDuration == 1) ? t("general.month") : t("general.months")}</b> 
        </PricingCard.AttributeItem>
        {(displayCheckoutInfo) ? 
          <PricingCard.AttributeItem>
            {t("general.first_month")}: <b>{subscription.priceFirstMonthDisplay}</b>
          </PricingCard.AttributeItem>
        : ""}
        {(displayCheckoutInfo && subscription.accountRegistrationFee > 0) ? 
          <PricingCard.AttributeItem>
            {t("general.registration_fee")}: <b>{subscription.accountRegistrationFeeDisplay}</b>
          </PricingCard.AttributeItem>
        : ""}
      </PricingCard.AttributeList>
      {(btnLink) ?
        <Link to={btnLink}>
          <PricingCard.Button >
            {t("shop.subscriptions.choose")} <Icon name="chevron-right" />
          </PricingCard.Button>
        </Link>
        : ""
      }
    </PricingCard>
  )
}


export default withTranslation()(withRouter(ShopClasspassPricingCard))


{/* <Grid.Col sm={6} lg={3}>
<PricingCard active>
  <PricingCard.Category>{"Premium"}</PricingCard.Category>
  <PricingCard.Price>{"$49"} </PricingCard.Price>
  <PricingCard.AttributeList>
    <PricingCard.AttributeItem>
      <strong>10 </strong>
      {"Users"}
    </PricingCard.AttributeItem>
    <PricingCard.AttributeItem hasIcon available>
      {"Sharing Tools"}
    </PricingCard.AttributeItem>
    <PricingCard.AttributeItem hasIcon available>
      {"Design Tools"}
    </PricingCard.AttributeItem>
    <PricingCard.AttributeItem hasIcon available={false}>
      {"Private Messages"}
    </PricingCard.AttributeItem>
    <PricingCard.AttributeItem hasIcon available={false}>
      {"Twitter API"}
    </PricingCard.AttributeItem>
  </PricingCard.AttributeList>
  <PricingCard.Button active>{"Choose plan"} </PricingCard.Button>
</PricingCard>
</Grid.Col> */}