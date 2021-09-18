const supabase = require('../servicos/supabase');

const atualizarImagem = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;
    let { imagem } = req.body;

    try {
        const produtoEncontrado = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produtoEncontrado) {
            return res.status(404).json('Produto não encontrado');
        }

        const bufferImg = Buffer.from(imagem, 'base64');
        imagem = `/produtos/${produtoEncontrado.nome}`;
        
        const { data, error } = await supabase
            .storage
            .from(process.env.SB_BUCKET)
            .update(`${usuario.id}${imagem}`, bufferImg);
        
        if(error) {
            return res.status(400).json(error.message);
        }

        const { publicURL, error } = supabase
            .storage
            .from(process.env.SB_BUCKET)
            .getPublicUrl(`${usuario.id}${imagem}`);
        
        if(error) {
            return res.status(400).json(error.message);
        }

        return res.status(200).json(publicURL);
    
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const deletarImagem = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;
    try {
        const produtoEncontrado = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produtoEncontrado) {
            return res.status(404).json('Produto não encontrado');
        }

        if(produtoEncontrado.imagem) {
            const { data, error } = await supabase
                .storage
                .from(process.env.SB_BUCKET)
                .remove(`${usuario.id}${imagem}`);
            
            if(error) {
                return res.status(400).json(error.message);
            }
        } else {
            return res.status(200).json("Esse produto já não tem imagem.");
        }

        return res.status(200).json("Imagem removida com sucesso.");
    } catch(error) {
        return res.status(400).json(error.message);
    }
}