import z from 'zod';

export const SearchQuerySchema = z
  .string({
    invalid_type_error: 'axtarış mətni tekst formatında olmalıdır',
  })
  .max(127, {
    message: 'axtarış mətni 127 simvoldan çox ola bilməz',
  })
  .optional();
