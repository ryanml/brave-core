/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import { Button, Column, Grid } from 'brave-ui/components'
import { TitleHeading } from 'brave-ui/old'

// Constants
import { TorrentObj } from '../constants/webtorrentState'

// Themes
import { theme } from '../constants/theme'
import Theme from 'brave-ui/theme/brave-default'
import { ThemeProvider } from 'brave-ui/theme'

let clipboardCopy = require('clipboard-copy')

interface Props {
  name?: string | string[]
  torrent?: TorrentObj
  torrentId: string
  tabId: number
  onStartTorrent: (torrentId: string, tabId: number) => void
  onStopDownload: (tabId: number) => void
}

export default class TorrentViewerHeader extends React.PureComponent<Props, {}> {
  onClick = () => {
    this.props.torrent
      ? this.props.onStopDownload(this.props.tabId)
      : this.props.onStartTorrent(this.props.torrentId, this.props.tabId)
  }

  onCopyClick = () => {
    clipboardCopy(this.props.torrentId)
  }

  render () {
    const { torrent } = this.props
    const name = typeof(this.props.name) === 'object'
      ? this.props.name[0]
      : this.props.name
    const title = torrent
      ? name
      : name
        ? `Start Torrenting ${name}?`
        : 'Loading torrent information...'
    const mainButtonText = torrent ? 'Stop Download' : 'Start Torrent'

    return (
      <ThemeProvider theme={Theme}>
        <Grid>
          <Column size={9} customStyle={theme.headerColumnLeft}>
            <TitleHeading
              text={title}
            />
          </Column>
          <Column size={3} customStyle={theme.headerColumnRight}>
            <Button
              type='accent'
              brand='brave'
              text={mainButtonText}
              onClick={this.onClick}
            />
            <Button
              type='accent'
              brand='brave'
              level='secondary'
              text='Copy Magnet Link'
              onClick={this.onCopyClick}
            />
          </Column>
        </Grid>
      </ThemeProvider>
    )
  }
}
