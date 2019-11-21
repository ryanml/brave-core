/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'

export default class DepositIcon extends React.PureComponent {

  render () {
    return (
      <svg width={'11'} height={'17'} xmlns={'http://www.w3.org/2000/svg'}>
        <g fill={'none'} fill-rule={'evenodd'}>
          <path d={'M9.133 10.09l-3.046 3.048a.68.68 0 01-.587.362.544.544 0 01-.383-.159l-3.25-3.25a.541.541 0 11.766-.767l2.406 2.407V1.04C5.039.744 5.2.5 5.5.5c.3 0 .635.243.635.542v10.514l2.232-2.232a.542.542 0 01.766.766z'} fill={'#D9B227'}/>
          <path stroke={'#D1AC26'} stroke-linecap={'square'} d={'M.5 16.5h10'}/>
        </g>
      </svg>
    )
  }
}
