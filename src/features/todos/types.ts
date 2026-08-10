export interface Todo {
  id: string
  text: string
  done: boolean
  createdAt: number
}

export type TodoFilter = 'all' | 'active' | 'completed'
