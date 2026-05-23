# Use este arquivo para fornecer instruções personalizadas específicas do workspace para o Copilot.
# Para mais detalhes, visite https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file

- [X] Verificar se o arquivo copilot-instructions.md foi criado no diretório .github.

- [X] Esclarecer os Requisitos do Projeto
	- Tipo de projeto: Aplicação simples
	- Linguagem: TypeScript
	- Frameworks: Nenhum

- [ ] Criar a Estrutura Inicial do Projeto (Scaffold)
	- Garantir que o passo anterior foi marcado como concluído.
	- Chamar a ferramenta de setup do projeto com o parâmetro projectType.
	- Executar o comando de scaffolding para criar os arquivos e pastas do projeto.
	- Usar '.' como diretório de trabalho.
	- Se não houver um projectType apropriado disponível, consultar a documentação usando as ferramentas disponíveis.
	- Caso contrário, criar a estrutura do projeto manualmente usando as ferramentas de criação de arquivos disponíveis.

- [ ] Customizar o Projeto
	- Verificar se todos os passos anteriores foram concluídos com sucesso e se você os marcou como concluídos.
	- Desenvolver um plano para modificar o código de acordo com os requisitos do usuário.
	- Aplicar as modificações usando as ferramentas apropriadas e as referências fornecidas pelo usuário.
	- Pular este passo para projetos do tipo "Hello World".

- [ ] Instalar Extensões Necessárias
	- APENAS instalar extensões mencionadas pela ferramenta get_project_setup_info. Caso contrário, pular este passo e marcá-lo como concluído.

- [ ] Compilar o Projeto
	- Verificar se todos os passos anteriores foram concluídos.
	- Instalar quaisquer dependências que estejam faltando.
	- Executar diagnósticos e resolver possíveis problemas.
	- Verificar se existem arquivos markdown no projeto com instruções relevantes sobre como fazer isso.

- [ ] Criar e Executar Task
	- Verificar se todos os passos anteriores foram concluídos.
	- Consultar https://code.visualstudio.com/docs/debugtest/tasks para determinar se o projeto precisa de uma task.
	- Se necessário, usar create_and_run_task para criar e executar uma task com base no package.json, README.md e estrutura do projeto.
	- Caso contrário, pular este passo.

- [ ] Executar o Projeto
	- Verificar se todos os passos anteriores foram concluídos.
	- Pedir confirmação do usuário para o modo de debug e só executar após confirmação.

- [ ] Garantir que a Documentação esteja Completa
	- Verificar se todos os passos anteriores foram concluídos.
	- Confirmar que os arquivos README.md e copilot-instructions.md no diretório .github existem e contêm informações atualizadas do projeto.
	- Limpar o arquivo copilot-instructions.md no diretório .github removendo todos os comentários HTML.