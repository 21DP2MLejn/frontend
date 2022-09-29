import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'

import {
    Button,
    Card,
    Grid,
    Text,
  } from "tabler-react"


class LoadMoreOnBottomScroll extends Component {
    componentDidMount() {
      window.addEventListener("scroll", this.handleOnScroll);
    }
  
    componentWillUnmount() {
      window.removeEventListener("scroll", this.handleOnScroll);
    }

    handleOnScroll = () => {
      // http://stackoverflow.com/questions/9439725/javascript-how-to-detect-if-browser-window-is-scrolled-to-bottom
      var scrollTop =
        (document.documentElement && document.documentElement.scrollTop) ||
        document.body.scrollTop;
      var scrollHeight =
        (document.documentElement && document.documentElement.scrollHeight) ||
        document.body.scrollHeight;
      var clientHeight =
        document.documentElement.clientHeight || window.innerHeight;
      var scrolledToBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
      if (scrolledToBottom) {
        const pageInfo = this.props.pageInfo
        if (pageInfo) {
          if (pageInfo.hasNextPage) {
            this.props.onLoadMore()
          }
        }
      }
    }

    render() {
      const t = this.props.t
      const onLoadMore = this.props.onLoadMore 
      const pageInfo = this.props.pageInfo
      const children = this.props.children


      return(
        <div>
          <Grid.Row>
            <Grid.Col md={12}>
              {children}
            </Grid.Col>
          </Grid.Row>
          <Grid.Row>
            <Grid.Col md={12}>
              { (!pageInfo) ? '':
                (pageInfo.hasNextPage) ? 
                  <Card>
                    <Card.Body>
                      <Button 
                        color="secondary"
                        outline
                        onClick={onLoadMore} 
                      >
                        {t('general.load_more')}
                      </Button>
                    </Card.Body>
                  </Card>
                : <span className="text-muted">{t("general.loaded_all")}</span>
              }
            </Grid.Col>
          </Grid.Row>
        </div>
      )
    }
}

LoadMoreOnBottomScroll.defaultProps = {
  onLoadMore: f=>f
}
  
export default withTranslation()(LoadMoreOnBottomScroll)
