import { upperFirst as lodashUpperFirst, mapKeys } from 'lodash'
import * as React from 'react'
import {
  IntlProvider as BaseIntlProvider,
  IntlShape,
  useIntl,
} from 'react-intl'

type TranslateFunction = <messageIds extends string>(
  id: messageIds,
  values?: Record<string, string | number | boolean | null | undefined | Date>,
  options?: { upperFirst?: boolean }
) => string
type GetTranslateFunctionReturnType<IntlParam> = IntlParam extends IntlShape
  ? TranslateFunction
  : null | TranslateFunction

const buildIntl = <messageIds extends string>({
  isRoot,
  prefix,
}: {
  isRoot?: boolean
  prefix: string
}) => {
  /**
   * Allows to get the translation function outside of React context
   */
  let currentIntl: IntlShape | null = null
  const ConsumeIntl = () => {
    currentIntl = useIntl()
    return <React.Fragment />
  }
  const getTranslateFunction = <IntlParam extends IntlShape | null>(
    rawIntl?: IntlParam
  ): GetTranslateFunctionReturnType<IntlParam> => {
    const intl = rawIntl ?? currentIntl
    if (!intl) {
      return null as GetTranslateFunctionReturnType<IntlParam>
    }

    return (id, values = {}, options = {}) => {
      const { upperFirst = true } = options

      let translation = id
        ? intl.formatMessage({ id: `${prefix}-${id}` }, values)
        : ''
      if (upperFirst) {
        translation = lodashUpperFirst(translation)
      }

      return translation
    }
  }

  const useInnerIntl = isRoot ? () => ({ messages: {}, locale: null }) : useIntl

  const useTranslate = () => {
    const intl = useIntl()

    return React.useCallback(getTranslateFunction(intl), [intl])
  }

  const IntlProvider: React.FunctionComponent<{
    locale?: string
    messages: Record<messageIds, string>
    children: React.ReactNode
  }> = ({ children, locale, messages }) => {
    const intl = useInnerIntl()

    const allMessages = {
      ...mapKeys(messages, (_, key) => `${prefix}-${key}`),
      ...intl.messages,
    }

    return (
      <BaseIntlProvider
        locale={intl.locale ?? locale ?? 'fr'}
        messages={allMessages}
      >
        <ConsumeIntl />
        {children}
      </BaseIntlProvider>
    )
  }

  return {
    getTranslateFunction,
    useTranslate,
    IntlProvider,
  }
}

export default buildIntl
