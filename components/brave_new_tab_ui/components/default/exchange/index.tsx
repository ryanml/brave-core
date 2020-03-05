/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import createWidget from '../widget/index'

export type ExchangeType = 'binance'

export interface ExchangeProps {
  type: ExchangeType
  showContent: boolean
  onShowContent: () => void
}

class Exchange extends React.PureComponent<ExchangeProps, {}> {

  renderTitle () {
    return null
  }

  renderTitleTab () {
    return null
  }

  renderBuyView () {
    return null
  }

  render () {
    const { type, showContent } = this.props

    if (!showContent) {
      return this.renderTitleTab()
    }

    return this.renderBuyView()
  }
}

export const ExchangeWidget = createWidget(Exchange)