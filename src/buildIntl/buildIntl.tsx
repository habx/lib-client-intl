import { upperFirst as lodashUpperFirst } from 'lodash'
import * as React from 'react'
import { IntlProvider as BaseIntlProvider, useIntl } from 'react-intl'

const buildIntl = <messageIds extends string>() => {
  const useTranslate = () => {
    const intl = useIntl()
    return (
      id?: messageIds,
      values: Record<
        string,
        string | number | boolean | null | undefined | Date
      > = {},
      options: { upperFirst?: boolean } = {}
    ) => {
      const { upperFirst = true } = options

      let translation = id ? intl.formatMessage({ id }, values) : ''
      if (upperFirst) {
        translation = lodashUpperFirst(translation)
      }

      return translation
    }
  }

  const IntlProvider: React.FunctionComponent<{
    locale: string
    messages: Record<messageIds, string>
  }> = ({ children, locale, messages }) => {
    const intl = useIntl()

    const allMessages = { ...messages, ...intl.messages }

    return (
      <BaseIntlProvider locale={locale} messages={allMessages}>
        {children}
      </BaseIntlProvider>
    )
  }

  return {
    useTranslate,
    IntlProvider,
  }
}

export default buildIntl
