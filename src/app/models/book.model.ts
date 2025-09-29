export interface Book {
  _id?: string;
  titulo: string;
  autor: string;
  preco: number;
  categoria: string;
  descricao: string;
  imagemUrl: string;
  isbn: string;
  editora?: string;
  anoPublicacao?: number;
  numeroPaginas?: number;
  estoque: number;
  disponivel: boolean;
  destaque?: boolean;
  promocao?: {
    ativo: boolean;
    desconto: number;
    dataInicio?: Date;
    dataFim?: Date;
  };
  avaliacoes?: Array<{
    usuario: string;
    nota: number;
    comentario?: string;
    data: Date;
  }>;
  tags?: string[];
  idioma?: string;
  dimensoes?: {
    altura?: number;
    largura?: number;
    profundidade?: number;
    peso?: number;
  };
  vendas?: number;
  createdAt?: Date;
  updatedAt?: Date;
  precoComDesconto?: number;
  notaMedia?: number;
  emEstoque?: boolean;
  promocaoAtiva?: boolean;
}

export interface CreateBookRequest {
  titulo: string;
  autor: string;
  preco: number;
  categoria: string;
  descricao: string;
  imagemUrl: string;
  isbn: string;
  editora?: string;
  anoPublicacao?: number;
  numeroPaginas?: number;
  estoque: number;
  disponivel?: boolean;
  destaque?: boolean;
  promocao?: {
    ativo: boolean;
    desconto: number;
    dataInicio?: Date;
    dataFim?: Date;
  };
  tags?: string[];
  idioma?: string;
  dimensoes?: {
    altura?: number;
    largura?: number;
    profundidade?: number;
    peso?: number;
  };
}

export interface UpdateBookRequest extends Partial<CreateBookRequest> {
  _id: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}
