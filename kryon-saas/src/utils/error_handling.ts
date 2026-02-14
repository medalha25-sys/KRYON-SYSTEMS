export function translateSupabaseError(error: any): string {
    if (!error) return 'Ocorreu um erro desconhecido.';

    const message = error.message || '';
    const details = error.details || '';
    const code = error.code || '';

    // Unique Constraint Violations
    if (code === '23505' || message.includes('duplicate key value promotes unique constraint')) {
        if (message.includes('email')) return 'Este e-mail já está cadastrado.';
        if (message.includes('cpf')) return 'Este CPF já está cadastrado.';
        if (message.includes('cnpj')) return 'Este CNPJ já está cadastrado.';
        if (message.includes('slug')) return 'Este identificador já existe. Tente outro.';
        if (message.includes('sku')) return 'Este código SKU já existe.';
        return 'Este registro já existe.';
    }

    // Foreign Key Violations
    if (code === '23503' || message.includes('violates foreign key constraint')) {
        return 'Não foi possível realizar a operação pois existe um vínculo com outro registro (Ex: Produtos em vendas, Clientes com agendamentos).';
    }

    // Check Constraint Violations
    if (code === '23514' || message.includes('violates check constraint')) {
        return 'Os dados informados são inválidos.';
    }

    // Not Null Violation
    if (code === '23502' || message.includes('null value in column')) {
        return 'Preencha todos os campos obrigatórios.';
    }

    // RLS / Permission
    if (code === '42501' || message.includes('row-level security policy') || message.includes('permission denied')) {
        return 'Você não tem permissão para realizar esta ação.';
    }

    // Invalid Input Syntax
    if (code === '22P02') {
        return 'Tipo de dado inválido enviado.';
    }

    // Connection Errors
    if (message.includes('fetch') || message.includes('connection') || message.includes('network')) {
        return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }

    return message; // Return original if no translation found, or maybe "Erro inesperado: " + message
}
