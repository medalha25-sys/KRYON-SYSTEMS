SELECT pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.shops'::regclass
AND conname = 'check_store_type';
