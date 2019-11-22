/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'

export default class HideIcon extends React.PureComponent {

  render () {
    return (
      <svg width={'24'} height={'18'} xmlns={'http://www.w3.org/2000/svg'}>
        <path d={'M12 18C4.205 18 0 11.612 0 9s4.205-9 12-9 12 6.388 12 9-4.205 9-12 9zm0-16C5.216 2 2 7.615 2 9c0 1.385 3.216 7 10 7s10-5.615 10-7c0-1.385-3.216-7-10-7zm0 12c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5zm0-8c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z'} fill={'#5E6175'} fillRule={'evenodd'}/>
      </svg>
    )
  }
}
