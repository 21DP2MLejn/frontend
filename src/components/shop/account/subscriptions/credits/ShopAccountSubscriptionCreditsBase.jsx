import React from 'react'
import { withTranslation } from 'react-i18next'
import { withRouter } from "react-router"

import {
  Page,
  Container
} from "tabler-react";
import SiteWrapperShop from "../../../../SiteWrapperShop"
import ButtonBack from '../../../../ui/ButtonBack';


function ShopAccountSubscriptionCreditsBase({ t, match, history, children, accountName="" }) {
  return (
    <SiteWrapperShop>
      <div className="my-3 my-md-5">
        <Container>
          <Page.Header title={t("shop.account.title")} subTitle={ accountName }>
              <div className="page-options d-flex">
                <ButtonBack returnUrl={`/shop/account/subscriptions`} />
              </div>
          </Page.Header>
          { children }
        </Container>
      </div>
    </SiteWrapperShop>
  )
}

export default withTranslation()(withRouter(ShopAccountSubscriptionCreditsBase))