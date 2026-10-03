import { z } from 'zod';

export const needSchema = z.object({
  description: z
    .string()
    .min(15, { message: 'Opis musi zawierać co najmniej 15 znaków.' }),
  gmina: z.string().min(2, { message: 'Nazwa gminy jest wymagana.' }),
  author_email: z
    .email({ message: 'Podaj poprawny adres e-mail.' }),
  author_role: z.enum(['resident', 'official', 'ngo']).default('resident'),
  area_id: z.coerce.number().optional(),
});

export type NeedInput = z.infer<typeof needSchema>;