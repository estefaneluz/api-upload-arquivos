const supabase = require('../servicos/supabase');
const knex = require('../conexao');

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
        imagem = `/produtos/${produtoEncontrado.nome.split(" ").join('')}`;

        if(produtoEncontrado.imagem) {
            const { data, error } = await supabase
            .storage
            .from(process.env.SB_BUCKET)
            .update(`${usuario.id}${produtoEncontrado.imagem}`, bufferImg);
        
            if(error) {
                return res.status(400).json(error.message);
            }
        } else {
            const { data, error } = await supabase
            .storage
            .from(process.env.SB_BUCKET)
            .upload(`${usuario.id}${imagem}`, bufferImg);
        
            if(error) {
                return res.status(400).json(error.message);
            }
        }

        const { publicURL, errorUrl } = supabase
            .storage
            .from(process.env.SB_BUCKET)
            .getPublicUrl(`${usuario.id}${imagem}`);
        
        if(errorUrl) {
            return res.status(400).json(errorUrl.message);
        }

        const produto = await knex('produtos')
            .where({ id })
            .update({
                imagem
            });

        if (!produto) {
            return res.status(400).json("O produto não foi atualizado");
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
                .remove([`${usuario.id}${produtoEncontrado.imagem}`]);
            
            if(error) {
                return res.status(400).json(error.message);
            }
        } else {
            return res.status(200).json("Esse produto já não tem imagem.");
        }

        const produto = await knex('produtos')
            .where({ id })
            .update({
                imagem: null
            });

        if (!produto) {
            return res.status(400).json("A imagem não foi deletada");
        }

        return res.status(200).json("Imagem removida com sucesso.");
    } catch(error) {
        return res.status(400).json(error.message);
    }
}

module.exports = { atualizarImagem, deletarImagem }