// Copyright (c) 2020 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

import * as React from 'react'

import {
  FeaturedSettingsWidget,
  StyledBannerImage,
  StyledSettingsInfo,
  StyledSettingsTitle,
  StyledSettingsCopy,
  StyledWidgetToggle,
  SettingsWidget,
  StyledButtonIcon,
  StyledFullMessage
} from '../../../components/default'
import togetherBanner from './assets/bravetogether.png'
import binanceBanner from './assets/binance.png'
import rewardsBanner from './assets/braverewards.png'
import geminiBanner from './assets/gemini.png'
import {
  ShowIcon,
  HideIcon
} from '../../../components/default/binance/assets/icons'

import { getLocale } from '../../../../common/locale'

interface Props {
  toggleShowBinance: () => void
  showBinance: boolean
  binanceSupported: boolean
  toggleShowTogether: () => void
  showTogether: boolean
  toggleShowRewards: () => void
  showRewards: boolean
  togetherSupported: boolean
  toggleShowGemini: () => void
  showGemini: boolean
  widgetSlotsFull: boolean
}

class MoreCardsSettings extends React.PureComponent<Props, {}> {

  renderFullMessage = () => {
    return (
      <StyledFullMessage>
        <span style={{ fontSize: '14px' }}><strong>Hide a card to free up space.</strong></span> <span>3/3 card slots used</span>
      </StyledFullMessage>
    )
  }

  renderActionButton = (on: boolean, toggleFunc: any, float: boolean = true) => {
    return (
      <StyledWidgetToggle onClick={toggleFunc} isAdd={!on} float={float}>
        <StyledButtonIcon>
          {
            on
            ? <HideIcon />
            : <ShowIcon />
          }
        </StyledButtonIcon>
        {
          on
          ? 'Hide'
          : 'Add'
        }
      </StyledWidgetToggle>
    )
  }

  render () {
    const {
      binanceSupported,
      toggleShowBinance,
      showBinance,
      toggleShowTogether,
      // showTogether,
      toggleShowRewards,
      showRewards,
      togetherSupported,
      toggleShowGemini,
      showGemini,
      widgetSlotsFull
    } = this.props
    return (
      <div>
        {
          togetherSupported
          ? <FeaturedSettingsWidget>
              <StyledBannerImage src={togetherBanner} />
              <StyledSettingsInfo>
                <StyledSettingsTitle>
                  {getLocale('togetherWidgetTitle')}
                </StyledSettingsTitle>
                <StyledSettingsCopy>
                  {getLocale('togetherWidgetWelcomeTitle')}
                </StyledSettingsCopy>
              </StyledSettingsInfo>
              {this.renderActionButton(false, toggleShowTogether)}
            </FeaturedSettingsWidget>
          : null
        }
        <SettingsWidget>
          <StyledBannerImage src={geminiBanner} />
          <StyledSettingsInfo>
            <StyledSettingsTitle>
              {'Gemini'}
            </StyledSettingsTitle>
            <StyledSettingsCopy>
              {'Trade Crypto on Gemini directly in your browser.'}
            </StyledSettingsCopy>
          </StyledSettingsInfo>
          {this.renderActionButton(showGemini, toggleShowGemini, false)}
        </SettingsWidget>
        {
          binanceSupported
          ? <SettingsWidget>
              <StyledBannerImage src={binanceBanner} />
              <StyledSettingsInfo>
                <StyledSettingsTitle>
                  {'Binance'}
                </StyledSettingsTitle>
                <StyledSettingsCopy>
                  {'Trade Crypto on Binance directly in your browser.'}
                </StyledSettingsCopy>
              </StyledSettingsInfo>
              {this.renderActionButton(showBinance, toggleShowBinance, false)}
            </SettingsWidget>
          : null
        }
        <SettingsWidget>
          <StyledBannerImage src={rewardsBanner} />
          <StyledSettingsInfo>
            <StyledSettingsTitle>
              {'Brave Rewards'}
            </StyledSettingsTitle>
            <StyledSettingsCopy>
              {'Earn tokens for watching privacy-respecting ads.'}
            </StyledSettingsCopy>
          </StyledSettingsInfo>
          {this.renderActionButton(showRewards, toggleShowRewards, false)}
        </SettingsWidget>
        <div style={{ height: '50px', clear: 'both' }}></div>
        {
          widgetSlotsFull
          ? this.renderFullMessage()
          : null
        }
      </div>
    )
  }
}

export default MoreCardsSettings
