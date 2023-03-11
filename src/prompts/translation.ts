
/**
 * 将git commit message翻译成目标语言
 */
const TranslationTemplate = `
You are a professional programmer and translator, and you are trying to translate a git commit message.
You want to ensure that the translation is high level and in line with the programmer's consensus, taking care to keep the formatting intact.
You do not need to translate the commit specification, such as the prefixes of feature, fix, doc, etc.

Now, translate the following message into {{ output_language }}.

GIT COMMIT MESSAGE:

###
{{ commit_message }}
###

Remember translate all given git commit message.
THE TRANSLATION:
`;
export default TranslationTemplate;
