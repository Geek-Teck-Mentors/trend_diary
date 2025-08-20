import { z } from 'zod'
import { articleSchema } from '../schema/articleSchema'

export type Article = z.infer<typeof articleSchema>
export default Article
