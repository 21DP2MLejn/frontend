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
import SelfCheckinBase from "../SelfCheckinBase"

import HasPermissionWrapper from "../../HasPermissionWrapper"
import { GET_ORGANIZATION_LOCATIONS_QUERY } from "./queries"


function Locations({ t, match, history }) {
  const { loading, error, data } = useQuery(GET_ORGANIZATION_LOCATIONS_QUERY);

  if (loading) return (
    <SelfCheckinBase>
      {t("general.loading_with_dots")}
    </SelfCheckinBase>
  )
  if (error) return (
    <SelfCheckinBase>
      {t("selfcheckin.locations.error_loading")}
    </SelfCheckinBase>
  )


  return (
    <SelfCheckinBase title={t("selfcheckin.home.title")}>
      <h4>{t("selfcheckin.locations.please_select")}</h4>
        <List.Group>
          {
            data.organizationLocations.edges.map(({node}) =>
              <List.GroupItem action>
                <Link to={"/selfcheckin/location/" + node.id}>
                  <div>
                    <span className="pull-right"><Icon name="chevron-right" /></span>
                    {node.name}
                  </div>
                </Link>
              </List.GroupItem>
          )}
        </List.Group>

          {/* //  List location rooms
          // <div>
          //   <h3>{node.name}</h3>
          //   <List.Group>
          //     {
          //       node.organizationlocationroomSet.edges.map(({node}) =>
          //         <List.GroupItem action>
          //           <Link to={"/selfcheckin/room/" + node.id}>
          //             <div>
          //               <span className="pull-right"><Icon name="chevron-right" /></span>
          //               {node.name}
          //             </div>
          //           </Link>
          //         </List.GroupItem>
          //       )
          //     }
          //   </List.Group>
          //   <br />
          // </div>
        // ) */}
      
    </SelfCheckinBase>
  )
}


export default withTranslation()(withRouter(Locations))