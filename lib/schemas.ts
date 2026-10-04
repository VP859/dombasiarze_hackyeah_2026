import { z } from 'zod';

export const needSchema = z.object({
  description: z
    .string()
    .min(15, { message: 'Opis musi zawierać co najmniej 15 znaków.' })
    .max(2000, { message: 'Opis może mieć najwyżej 2000 znaków.' }),
  gmina: z.string().min(2, { message: 'Nazwa gminy jest wymagana.' }),
  author_email: z
    .email({ message: 'Podaj poprawny adres e-mail.' }),
  author_role: z.enum(['resident', 'official', 'ngo']).default('resident'),
  challenges: z.array(z.string().max(50)).max(10).default([]),
  audiences: z.array(z.string().max(50)).max(10).default([]),
  area_id: z.coerce.number().optional(),
});

export type NeedInput = z.infer<typeof needSchema>;