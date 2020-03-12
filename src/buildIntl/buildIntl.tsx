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
  const useInnerIntl = isRoot ? () => ({ messages: {}, locale: null }) : useIntl

  const useTranslate = () => {
    const intl = useIntl()

    const ref = React.useRef<IntlShape>(intl)
    ref.current = intl

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
          ? ref.current.formatMessage({ id: `${prefix}-${id}` }, values)
          : ''
        if (upperFirst) {
          translation = lodashUpperFirst(translation)
        }

        return translation
      },
      []
    )
  }

  const IntlProvider: React.FunctionComponent<{
    locale?: string
    messages: Record<messageIds, string>
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
