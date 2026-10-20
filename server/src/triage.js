const categoryRules = [
  ['Billing', /charge|invoice|billing|payment/],
  ['Account access', /password|sign in|login|account/],
  ['Shipping', /ship|tracking|delivery|order/],
  ['Technical issue', /app|crash|error|bug|not working/],
]

export function triage(input) {
  const content = `${input.subject} ${input.description}`.toLowerCase()
  const priority =
    /(fraud|locked out|cannot access|unable to access|security breach|data loss|service down)/.test(
      content
    )
      ? 'Urgent'
      : /(charged twice|duplicate charge|payment failed|app crashes|not working|overdue)/.test(
            content
          )
        ? 'High'
        : input.priority || 'Normal'
  const category =
    input.category || categoryRules.find(([, pattern]) => pattern.test(content))?.[0] || 'Other'
  return { ...input, category, priority }
}
