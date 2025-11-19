echo "Vamos começar a comprimir"

#Precisa ter o gltf instalado no node.
#Loop para comprimir todos os .glb do folder.

mkdir -p otimizados

for f in *.glb; do
	echo "Comprimindo file $f"

	npx @gltf-transform/cli optimize "$f" "otimizados/$f" --texture-size 1024 --compress draco;

done 
