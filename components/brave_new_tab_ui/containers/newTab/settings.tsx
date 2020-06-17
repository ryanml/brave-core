// Copyright (c) 2020 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

import * as React from 'react'

import {
  SettingsMenu,
  SettingsTitle,
  SettingsWrapper,
  SettingsSidebar,
  SettingsFeatureBody,
  SettingsContent,
  SettingsCloseIcon,
  SettingsSidebarButton,
  SettingsSidebarActiveButtonSlider,
  SettingsSidebarButtonText,
  SettingsSidebarSVGContent
} from '../../components/default'

import { getLocale } from '../../../common/locale'

// Icons
import { CloseStrokeIcon } from 'brave-ui/components/icons'
import BackgroundImageIcon from './settings/icons/backgroundImage.svg'
import NraveStatsIcon from './settings/icons/braveStats.svg'
import TopSitesIcon from './settings/icons/topSites.svg'
import ClockIcon from './settings/icons/clock.svg'
import MoreCardsIcon from './settings/icons/moreCards.svg'

// Tabs
import BackgroundImageSettings from './settings/backgroundImage'
import BraveStatsSettings from './settings/braveStats'
import TopSitesSettings from './settings/topSites'
import ClockSettings from './settings/clock'
import MoreCardsSettings from './settings/moreCards'

export interface Props {
  textDirection: string
  showSettingsMenu: boolean
  onClickOutside: () => void
  toggleShowBackgroundImage: () => void
  toggleShowClock: () => void
  toggleShowStats: () => void
  toggleShowTopSites: () => void
  toggleShowRewards: () => void
  toggleShowTogether: () => void
  toggleShowBinance: () => void
  toggleShowGemini: () => void
  toggleBrandedWallpaperOptIn: () => void
  showBackgroundImage: boolean
  showStats: boolean
  showClock: boolean
  showTopSites: boolean
  brandedWallpaperOptIn: boolean
  allowSponsoredWallpaperUI: boolean
  showRewards: boolean
  showTogether: boolean
  showBinance: boolean
  binanceSupported: boolean
  togetherSupported: boolean
  focusMoreCards: boolean
  showGemini: boolean
  widgetSlotsFull: boolean
}

type ActiveTabType = 'BackgroundImage' | 'BraveStats' | 'TopSites' | 'Clock' | 'moreCards'

interface State {
  activeTab: number
}

export default class Settings extends React.PureComponent<Props, State> {
  settingsMenuRef: React.RefObject<any>
  constructor (props: Props) {
    super(props)
    this.settingsMenuRef = React.createRef()
    this.state = { activeTab: props.allowSponsoredWallpaperUI ? 0 : 1 }
  }

  handleClickOutside = (event: Event) => {
    if (
      this.settingsMenuRef &&
      this.settingsMenuRef.current &&
      !this.settingsMenuRef.current.contains(event.target)
    ) {
      this.props.onClickOutside()
    }
  }

  componentDidMount () {
    document.addEventListener('mousedown', this.handleClickOutside)
    document.addEventListener('keydown', this.onKeyPressSettings)
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  componentDidUpdate (prevProps: Props) {
    if (!prevProps.focusMoreCards && this.props.focusMoreCards) {
      this.setState({ activeTab: 4 })
    }
  }

  onKeyPressSettings = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.props.onClickOutside()
    }
  }

  toggleShowBackgroundImage = () => {
    this.props.toggleShowBackgroundImage()
  }

  setActiveTab (activeTab: number) {
    this.setState({ activeTab })
  }

  get activeTabOptions (): ActiveTabType[] {
    return [
      'BackgroundImage', 'BraveStats', 'TopSites', 'Clock', 'moreCards'
    ]
  }

  getTabIcon (tab: number, isActiveTab: boolean) {
    let srcUrl
    switch (tab) {
      case 0:
        srcUrl = BackgroundImageIcon
        break
      case 1:
        srcUrl = NraveStatsIcon
        break
      case 2:
        srcUrl = TopSitesIcon
        break
      case 3:
        srcUrl = ClockIcon
        break
      case 4:
        srcUrl = MoreCardsIcon
        break
      default:
        srcUrl = BackgroundImageIcon
        break
    }
    return <SettingsSidebarSVGContent isActive={isActiveTab} src={srcUrl} />
  }

  render () {
    const {
      textDirection,
      showSettingsMenu,
      toggleShowClock,
      toggleShowStats,
      toggleShowTopSites,
      toggleShowRewards,
      toggleShowTogether,
      toggleBrandedWallpaperOptIn,
      showBackgroundImage,
      showStats,
      showClock,
      showTopSites,
      showRewards,
      showTogether,
      brandedWallpaperOptIn,
      allowSponsoredWallpaperUI,
      toggleShowBinance,
      showBinance,
      binanceSupported,
      togetherSupported,
      toggleShowGemini,
      showGemini,
      widgetSlotsFull
    } = this.props
    const { activeTab } = this.state

    return showSettingsMenu
      ? (
        <SettingsWrapper
          textDirection={textDirection}
          title={getLocale('dashboardSettingsTitle')}
        >
          <SettingsMenu innerRef={this.settingsMenuRef} textDirection={textDirection}>
            <SettingsTitle id='settingsTitle'>
              <h1>{getLocale('dashboardSettingsTitle')}</h1>
              <SettingsCloseIcon onClick={this.props.onClickOutside}>
                <CloseStrokeIcon />
              </SettingsCloseIcon>
            </SettingsTitle>
            <SettingsContent id='settingsBody'>
              <SettingsSidebar id='sidebar'>
                <SettingsSidebarActiveButtonSlider translateTo={activeTab} />
                {
                  this.activeTabOptions.map((tabName, index) => {
                    const name = index === (this.activeTabOptions.length - 1) ? tabName : `show${tabName}`
                    if (index === 0 && !allowSponsoredWallpaperUI) {
                      return <div key={`sidebar-button=${index}`} />
                    }
                    return (
                      <SettingsSidebarButton
                        tabIndex={0}
                        key={`sidebar-button-${index}`}
                        activeTab={activeTab === index}
                        onClick={this.setActiveTab.bind(this, index)}
                      >
                        {this.getTabIcon(index, activeTab === index)}
                        <SettingsSidebarButtonText
                          isActive={activeTab === index}
                          data-text={getLocale(name)}
                        >
                          {getLocale(name)}
                        </SettingsSidebarButtonText>
                      </SettingsSidebarButton>
                    )
                  })
                }
              </SettingsSidebar>
              <SettingsFeatureBody id='content'>
                {
                  activeTab === 0
                    ? (
                    <BackgroundImageSettings
                      toggleBrandedWallpaperOptIn={toggleBrandedWallpaperOptIn}
                      toggleShowBackgroundImage={this.toggleShowBackgroundImage}
                      brandedWallpaperOptIn={brandedWallpaperOptIn}
                      showBackgroundImage={showBackgroundImage}
                    />
                  ) : null
                }
                {
                  activeTab === 1
                    ? (
                      <BraveStatsSettings
                        toggleShowStats={toggleShowStats}
                        showStats={showStats}
                      />
                    ) : null
                }
                {
                  activeTab === 2
                    ? (
                      <TopSitesSettings
                        toggleShowTopSites={toggleShowTopSites}
                        showTopSites={showTopSites}
                      />
                    ) : null
                }
                {
                  activeTab === 3
                    ? (
                      <ClockSettings
                        toggleShowClock={toggleShowClock}
                        showClock={showClock}
                      />
                    ) : null
                }
                {
                  activeTab === 4
                    ? (
                      <MoreCardsSettings
                        toggleShowGemini={toggleShowGemini}
                        showGemini={showGemini}
                        toggleShowBinance={toggleShowBinance}
                        showBinance={showBinance}
                        binanceSupported={binanceSupported}
                        toggleShowTogether={toggleShowTogether}
                        showTogether={showTogether}
                        togetherSupported={togetherSupported}
                        widgetSlotsFull={widgetSlotsFull}
                        toggleShowRewards={toggleShowRewards}
                        showRewards={showRewards}
                      />
                    ) : null
                }
              </SettingsFeatureBody>
            </SettingsContent>
          </SettingsMenu>
        </SettingsWrapper>
    ) : null
  }
}
