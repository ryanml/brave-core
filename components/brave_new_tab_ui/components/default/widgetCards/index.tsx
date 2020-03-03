/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import createWidget from '../widget/index'
import {
  StyledCardsContainer
} from './style'

interface WidgetCardProps {
  children: React.ReactNode[]
}

class WidgetCards extends React.PureComponent<WidgetCardProps, {}> {
  render () {
    const { children } = this.props

    // No stacking logic for single widgets
    if (children.length === 1) {
      return (
        <>
          {children[0]}
        </>
      )
    }

    return (
      <StyledCardsContainer>
        {children.map((widget: React.ReactNode, i: number) => {
          return (<div key={`widget-${i}`}>{widget}</div>)
        })}
      </StyledCardsContainer>
    )
  }
}

export const WidgetCardStack = createWidget(WidgetCards)
