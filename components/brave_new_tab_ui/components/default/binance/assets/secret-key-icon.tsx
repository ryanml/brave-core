/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'

export default class SecretKeyIcon extends React.PureComponent {

  render () {
    return (
      <svg width={'12'} height={'14'} xmlns={'http://www.w3.org/2000/svg'}>
        <path d={'M10.042 13.5H2.458a1.627 1.627 0 01-1.625-1.625V6.458c0-.896.73-1.625 1.625-1.625H3V3.75A3.254 3.254 0 016.25.5 3.254 3.254 0 019.5 3.75v1.083h.542c.896 0 1.625.73 1.625 1.625v5.417c0 .896-.73 1.625-1.625 1.625zM6.25 1.583A2.169 2.169 0 004.083 3.75v1.083h4.334V3.75A2.169 2.169 0 006.25 1.583zm4.333 4.875a.542.542 0 00-.541-.541H2.458a.542.542 0 00-.541.541v5.417c0 .298.243.542.541.542h7.584a.543.543 0 00.541-.542V6.458zM6.792 9.016v1.234a.542.542 0 01-1.084 0V9.016A1.08 1.08 0 016.25 7a1.08 1.08 0 01.542 2.016z'} fill={'#3B3E4F'} fillRule={'evenodd'}/>
      </svg>
    )
  }
}
