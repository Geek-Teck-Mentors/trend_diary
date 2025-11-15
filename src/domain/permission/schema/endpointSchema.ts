import { z } from 'zod'

export const endpointSchema = z.object({
  endpointId: z.number().int().positive('endpointIdは正の整数である必要がある'),
  path: z.string().min(1, 'pathは必須').max(255),
  method: z.string().min(1, 'methodは必須').max(10),
  createdAt: z.date(),
})

export const endpointInputSchema = endpointSchema.pick({
  path: true,
  method: true,
})

export type Endpoint = z.infer<typeof endpointSchema>
export type EndpointInput = z.infer<typeof endpointInputSchema>
