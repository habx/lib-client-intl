import { upperFirst as lodashUpperFirst } from 'lodash'
import * as React from 'react'
import { IntlProvider as BaseIntlProvider, useIntl } from 'react-intl'

const buildIntl = <messageIds extends string>({
  isRoot = true,
}: { isRoot?: boolean } = {}) => {
  const useInnerIntl = isRoot ? () => ({ messages: {}, locale: null }) : useIntl

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
    const intl = useInnerIntl()

    const allMessages = { ...messages, ...intl.messages }

    return (
      <BaseIntlProvider locale={intl.locale || locale} messages={allMessages}>
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
