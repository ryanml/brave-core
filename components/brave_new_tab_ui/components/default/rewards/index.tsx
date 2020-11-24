/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import createWidget from '../widget/index'
import { convertBalance } from '../../../../brave_rewards/resources/page/utils'
import { getLocale } from '../../../../common/locale'

import {
  WidgetWrapper,
  WidgetLayer,
  NotificationsList,
  BatIcon,
  RewardsTitle,
  //Footer,
  //ServiceLink,
  LearnMoreText,
  AmountItem,
  AmountDescription,
  Amount,
  ConvertedAmount,
  AmountUSD,
  TurnOnAdsButton,
  UnsupportedMessage,
  TurnOnText,
  StyledTOS
} from './style'
import { StyledTitleTab } from '../widgetTitleTab'
import Notification from './notification'
import { BatColorIcon } from 'brave-ui/components/icons'

export interface RewardsProps {
  enabledAds: boolean
  balance: NewTab.RewardsBalance
  parameters: NewTab.RewardsParameters
  promotions: NewTab.Promotion[]
  totalContribution: number
  adsEstimatedEarnings: number
  onlyAnonWallet?: boolean
  adsSupported?: boolean
  isNotification?: boolean
  showContent: boolean
  stackPosition: number
  onShowContent: () => void
  onStartRewards: () => void
  onDismissNotification: (id: string) => void
}

class Rewards extends React.PureComponent<RewardsProps, {}> {
  renderAmountItem = () => {
    const {
      parameters,
      enabledAds,
      onStartRewards,
      adsEstimatedEarnings,
      onlyAnonWallet,
      adsSupported
    } = this.props

    const rate = parameters.rate || 0.0
    const showEnableAds = !enabledAds && adsSupported
    const amount = adsEstimatedEarnings
    const converted = convertBalance(amount, rate)
    const batFormatString = onlyAnonWallet ? getLocale('rewardsWidgetBap') : getLocale('rewardsWidgetBat')

    return (
      <AmountItem isActionPrompt={!!showEnableAds} isLast={false}>
        {
          showEnableAds
          ? <>
            <TurnOnText>
              {getLocale('rewardsWidgetTurnOnText')}
            </TurnOnText>
            <TurnOnAdsButton
              onClick={onStartRewards}
              type={'accent'}
              brand={'rewards'}
              text={getLocale('rewardsWidgetTurnOnAds')}
            />
          </>
          : null
        }
        {
          !showEnableAds && adsSupported
          ? <div data-test-id={`widget-amount-total-ads`}>
              <Amount>{amount.toFixed(3)}</Amount>
              <ConvertedAmount>
                {batFormatString}<AmountUSD>{converted} USD</AmountUSD>
              </ConvertedAmount>
            </div>
          : null
        }
        {
          !adsSupported
          ? <UnsupportedMessage>
              {getLocale('rewardsWidgetAdsNotSupported')}
            </UnsupportedMessage>
          : null
        }
        <AmountDescription>
          {
            showEnableAds
            ? <StyledTOS title={getLocale('rewardsWidgetStartUsing')} />
            : getLocale('rewardsWidgetEstimatedEarnings')
          }
        </AmountDescription>
      </AmountItem>
    )
  }

  renderTipsBox = () => {
    const {
      parameters,
      onlyAnonWallet,
      totalContribution
    } = this.props

    const rate = parameters.rate || 0.0
    const amount = totalContribution
    const converted = convertBalance(amount, rate)
    const batFormatString = onlyAnonWallet ? getLocale('rewardsWidgetBap') : getLocale('rewardsWidgetBat')

    if (amount === 0) {
      return null
    }

    return (
      <AmountItem isLast={true}>
        <div data-test-id={`widget-amount-total-tips`}>
          <Amount>{amount.toFixed(3)}</Amount>
          <ConvertedAmount>
            {batFormatString}<AmountUSD>{converted} USD</AmountUSD>
          </ConvertedAmount>
        </div>
        <AmountDescription>
          {getLocale('rewardsWidgetMonthlyTips')}
        </AmountDescription>
      </AmountItem>
    )
  }

  renderRewardsInfo = () => {
    const {
      adsSupported
    } = this.props

    return (
      <div>
        {adsSupported && this.renderAmountItem()}
        {this.renderTipsBox()}
      </div>
    )
  }

  renderLearnMore = () => {
    return (
      <LearnMoreText>
        By clicking, you agree to the<br/><span style={{ 'color': '#737ADE'}}>Terms of Service</span> and <span style={{ 'color': '#737ADE'}}>Privacy Policy.</span>
      </LearnMoreText>
    )
  }

  renderNotifications = (singleOrphaned = false) => {
    let {
      promotions,
      onDismissNotification
    } = this.props

    // TODO(petemill): If we want a true 'single' mode then
    // only show a single notification from any source.
    // For now, this only happens for the branded wallpaper notification.
    promotions = singleOrphaned ? [] : (promotions || [])
    const Wrapper = singleOrphaned ? React.Fragment : NotificationsList
    return (
      <Wrapper>
        {promotions.map((promotion: NewTab.Promotion, index) => {
          return (
            <Notification
              promotion={promotion}
              key={`notification-${index}`}
              onDismissNotification={onDismissNotification}
              order={index + 1}
            />
          )
        })}
      </Wrapper>
    )
  }

  renderTitle = () => {
    const { showContent } = this.props

    return (
      <RewardsTitle isInTab={!showContent}>
        <BatIcon>
          <BatColorIcon />
        </BatIcon>
        {getLocale('rewardsWidgetBraveRewards')}
      </RewardsTitle>
    )
  }

  renderBalanceView = () => {
    return (
      <div style={{'margin': '15px 0px 10px 0', textAlign: 'left', fontFamily: 'Poppins, sans-serif', color: '#F0F2FF'}}>
        <AmountDescription>
          {'Token Balance'}
        </AmountDescription>
        <div data-test-id={`widget-amount-total-ads`}>
          <Amount>{'10.000'}</Amount>
          <ConvertedAmount>
            {'BAT'}
          </ConvertedAmount>
        </div>
        <AmountDescription>
          {'= $2.50 USD'}
        </AmountDescription>
      </div>
    )
  }

  renderProgressView = () => {
    return(
      <div style={{ 'padding': '10px 0', fontFamily: 'Poppins, sans-serif', color: '#F0F2FF' }}>
        <span style={{'fontWeight': 'bold', marginRight: '5px'}}>Nov 1 - Nov 30</span><span style={{ marginRight: '10px'}}>Progress</span><div style={{ 'display': 'inline-block', 'width': '89px', height: '1px', background: 'rgba(255, 255, 255, 0.3)', verticalAlign: 'middle'}}></div>
      </div>
    )
  }

  renderEarnAndGiveView = () => {
    return (
      <div style={{ 'margin': '5px 0 65px 0'}}>
        <div style={{ width: '50%', float: 'left', textAlign: 'left'}}>
          <AmountDescription style={{ marginBottom: '5px'}}>
            {'Earning'} <div style={{ display: 'inline-block', verticalAlign: 'sub', marginLeft: '3px' }}><svg width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.948 11.95A6.955 6.955 0 016.998 14a6.956 6.956 0 01-4.951-2.05c-2.73-2.73-2.73-7.17 0-9.9A6.956 6.956 0 016.997 0c1.871 0 3.63.728 4.951 2.05A6.95 6.95 0 0114 7c0 1.87-.729 3.628-2.052 4.95zm-.824-9.075a5.796 5.796 0 00-4.126-1.708 5.796 5.796 0 00-4.126 1.708 5.84 5.84 0 000 8.25 5.796 5.796 0 004.126 1.708c1.559 0 3.024-.606 4.126-1.708A5.793 5.793 0 0012.833 7a5.794 5.794 0 00-1.71-4.125zm-2.959 8.208H5.831a.584.584 0 010-1.166h.584V7.583H5.83a.584.584 0 010-1.166h1.167c.322 0 .584.261.584.583v2.917h.583a.583.583 0 010 1.166zM6.998 5.25a1.169 1.169 0 01-1.167-1.167 1.168 1.168 0 012.334 0c0 .643-.523 1.167-1.167 1.167z" fill="#fff"/></svg></div>
          </AmountDescription>
          <div>
            <Amount style={{ fontSize: '25px' }}>
              {'0.142'}
            </Amount>
            <ConvertedAmount>
              {'BAT'}
            </ConvertedAmount>
          </div>
        </div>
        <div style={{ width: '50%', float: 'right', textAlign: 'left'}}>
          <AmountDescription style={{ marginBottom: '8px'}}>
            {'Giving'}
          </AmountDescription>
          <div>
            <Amount style={{ fontSize: '25px' }}>
              {'10.000'}
            </Amount>
            <ConvertedAmount>
              {'BAT'}
            </ConvertedAmount>
          </div>
        </div>
      </div>
    )
  }

  renderSettingsLink = () => {
    return (
      <div style={{ margin: '10px 0 0px 0', clear: 'both', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'inline-block', marginRight: '5px' }}>
          <svg width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.5 13.268c-.062 0-.125 0-.188-.003l-.857 1.305a.927.927 0 01-1.026.384A7.5 7.5 0 012.3 13.165a.921.921 0 01-.18-1.084l.713-1.39a5.435 5.435 0 01-.183-.313l-1.574-.084a.922.922 0 01-.85-.69A7.335 7.335 0 010 7.807c0-.605.077-1.206.226-1.797.1-.393.448-.67.847-.69l1.577-.083c.057-.106.118-.21.183-.314l-.712-1.39A.922.922 0 012.3 2.45 7.496 7.496 0 015.427.66a.928.928 0 011.028.384l.857 1.305a5.415 5.415 0 01.376 0l.857-1.305A.928.928 0 019.572.66c1.178.335 2.25.95 3.128 1.79a.923.923 0 01.18 1.084l-.713 1.39c.065.102.125.207.183.313l1.574.083c.401.02.75.298.85.691.15.59.226 1.191.226 1.796a7.34 7.34 0 01-.226 1.798.922.922 0 01-.847.69l-1.577.083c-.058.106-.118.21-.183.313l.713 1.392a.923.923 0 01-.181 1.083 7.5 7.5 0 01-3.126 1.788.928.928 0 01-1.028-.384l-.857-1.305a5.415 5.415 0 01-.188.003zm-1.926.503l.943-1.437a.588.588 0 01.546-.263 4.653 4.653 0 00.874 0c.216-.02.427.08.546.263l.944 1.437a6.325 6.325 0 002.319-1.324l-.783-1.529a.588.588 0 01.047-.612 4.32 4.32 0 00.432-.741c.09-.2.285-.331.503-.343l1.733-.092c.097-.437.146-.879.146-1.323 0-.444-.049-.886-.146-1.322l-1.733-.092a.588.588 0 01-.503-.343 4.316 4.316 0 00-.432-.741.588.588 0 01-.047-.613l.783-1.528a6.325 6.325 0 00-2.32-1.324L8.484 3.28a.588.588 0 01-.546.262 4.646 4.646 0 00-.874 0 .588.588 0 01-.546-.262l-.943-1.437a6.322 6.322 0 00-2.32 1.324l.783 1.528c.101.197.083.434-.047.613-.17.235-.314.482-.431.74a.588.588 0 01-.504.344l-1.734.092a6.125 6.125 0 00-.146 1.322c0 .444.05.887.146 1.323l1.734.092a.588.588 0 01.504.344c.117.258.261.505.431.74.13.179.148.416.047.612l-.783 1.529a6.324 6.324 0 002.32 1.324zm-.807-5.964a2.733 2.733 0 115.466 0 2.733 2.733 0 01-5.466 0zm1.176 0a1.557 1.557 0 103.114 0 1.557 1.557 0 00-3.114 0z" fill="#fff" opacity=".8"/></svg>
        </div>
        <span>Rewards Settings</span>
      </div>
    )
  }

  renderEarningsNotification = () => {
    return (
      <div style={{ padding: '10px', background: '#17171F', fontFamily: 'Poppins, sans-serif', color: '#FFF'}}>
        <div style={{ display: 'inline-block', marginRight: '5px' }}>
          <svg width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.417 12.252v1.165c0 .322-.26.583-.583.583h-5.25a.583.583 0 01-.583-.583V11.67c0-.322.261-.583.583-.583v-.582h-.583a.583.583 0 01-.583-.583V8.173c0-.322.26-.583.583-.583h5.25c.322 0 .583.26.583.582v1.166h.583c.322 0 .583.261.583.583v1.748c0 .322-.26.583-.583.583zm-5.25.582h4.083v-.582H8.168v.582zm3.5-4.079H7.584v.583h4.083v-.583zm1.167 1.748H8.75v.583h4.083v-.582zm-2.878-3.85C9.2 5.632 8.288 4.949 7.93 4.64H4.287c-1 .86-3.123 2.906-3.123 4.673 0 2.245 1.238 3.523 3.504 3.523h.584c.321 0 .583.266.583.582a.587.587 0 01-.583.583h-.584C1.751 14 0 12.198 0 9.312c0-2.283 2.381-4.558 3.326-5.374-.438-.73-1.14-2.09-.957-3.003.068-.341.252-.617.53-.797.634-.41 1.178.243 1.506.632.047.055.108.128.168.196L4.58.953C4.782.6 5.12.006 5.83.006c.63 0 .95.304 1.142.486.024.021.045.044.068.063.213-.007.301-.067.468-.178C7.747.219 8.073 0 8.678 0c.47 0 .868.29 1.064.774.308.763.118 2.1-.762 3.212a11.462 11.462 0 011.917 1.994.567.567 0 01-.129.8.587.587 0 01-.812-.126zM8.635 1.148c-.216.007-.305.066-.472.178-.238.16-.564.377-1.169.377-.42 0-.674-.24-.826-.383-.134-.128-.176-.167-.337-.167-.048.032-.17.247-.237.363-.172.303-.433.76-.963.76-.461 0-.788-.376-1.102-.75.112.54.522 1.379.889 1.969H7.86c.614-.655.856-1.437.857-1.922.001-.241-.052-.374-.083-.425z" fill="#FFD43B"/></svg>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 'bold'}}>Ad earnings received</span>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 'bold', lineHeight: '16px'}}>You earned 16.3 BAT from viewing Brave Private Ads!</p>
          <span style={{ fontSize: '11px' }}>DEC 5</span>
        </div>
        <TurnOnAdsButton
          onClick={undefined}
          type={'accent'}
          brand={'rewards'}
          text={'Claim earnings'}
        />
      </div>
    )
  }

  renderOptIn = () => {
    return (
      <div style={{'marginTop': '10px', textAlign: 'center', fontFamily: 'Poppins, sans-serif', color: '#F0F2FF'}}>
        <TurnOnText style={{'fontWeight': 'bold', fontSize: '13px', marginBottom: '10px'}}>
          {'Earn tokens and give back'}
        </TurnOnText>        
        <TurnOnText>
          {'Earn tokens by viewing Brave Private Ads and support content creators automatically.'}
        </TurnOnText>
        <TurnOnAdsButton
          onClick={undefined}
          type={'accent'}
          brand={'rewards'}
          text={'Start using Rewards'}
        />
        {this.renderLearnMore()}
      </div>
    )
  }

  renderTitleTab = () => {
    const { onShowContent, stackPosition } = this.props

    return (
      <StyledTitleTab onClick={onShowContent} stackPosition={stackPosition}>
        {this.renderTitle()}
      </StyledTitleTab>
    )
  }

  render () {
    const {
      isNotification,
      showContent,
      // totalContribution
    } = this.props

    if (!showContent) {
      return this.renderTitleTab()
    }

    // Handle isNotification:
    //   - if rewards isn't on, we ourselves are a notification
    //   - if rewards is on, only show a single notification (the last one)
    //     (intended for branded wallpaper notification).
    if (isNotification) {
      return this.renderNotifications(true)
    }

    return (
      <WidgetWrapper>
        <WidgetLayer>
          {this.renderTitle()}
          {this.renderEarningsNotification()}
          {this.renderProgressView()}
          {this.renderEarnAndGiveView()}
          {this.renderSettingsLink()}
        </WidgetLayer>
        {this.renderNotifications()}
      </WidgetWrapper>
    )
  }
}

export const RewardsWidget = createWidget(Rewards)
