SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'organizations';

SELECT * FROM public.shops LIMIT 1;
SELECT * FROM public.organizations LIMIT 1;
