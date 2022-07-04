export interface Pagamento {
  id_pagamento?: number
  id_aluno: number
  data_vencimento: Date
  data_pagamento?: Date
  valor_mensalidade: number
  via_de_pagamento?: string
  old_data_pagamento?: Date
  old_via_de_pagamento?: string
}