import { upperFirst as lodashUpperFirst, mapKeys } from 'lodash'
import * as React from 'react'
import {
  IntlProvider as BaseIntlProvider,
  IntlShape,
  useIntl,
} from 'react-intl'

const buildIntl = <messageIds extends string>({
  isRoot,
  prefix,
}: {
  isRoot?: boolean
  prefix: string
}) => {
  /**
   * Allows to get the current intl instance outside of React context
   */
  let currentIntl: null | IntlShape = null
  const getCurrentIntl = () => currentIntl

  const useInnerIntl = isRoot ? () => ({ messages: {}, locale: null }) : useIntl

  const useTranslate = () => {
    const intl = useIntl()

    return React.useCallback(
      (
        id?: messageIds,
        values: Record<
          string,
          string | number | boolean | null | undefined | Date
        > = {},
        options: { upperFirst?: boolean } = {}
      ) => {
        const { upperFirst = true } = options

        let translation = id
          ? intl.formatMessage({ id: `${prefix}-${id}` }, values)
          : ''
        if (upperFirst) {
          translation = lodashUpperFirst(translation)
        }

        return translation
      },
      [intl]
    )
  }

  const IntlProvider: React.FunctionComponent<{
    locale?: string
    messages: Record<messageIds, string>
    children: React.ReactNode
  }> = ({ children, locale, messages }) => {
    const intl = useInnerIntl()
    currentIntl = intl as IntlShape

    const allMessages = {
      ...mapKeys(messages, (_, key) => `${prefix}-${key}`),
      ...intl.messages,
    }

    return (
      <BaseIntlProvider
        locale={intl.locale ?? locale ?? 'fr'}
        messages={allMessages}
      >
        {children}
      </BaseIntlProvider>
    )
  }

  return {
    getCurrentIntl,
    useTranslate,
    IntlProvider,
  }
}

export default buildIntl
