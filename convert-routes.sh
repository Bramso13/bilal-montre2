#!/bin/bash

# Trouver tous les fichiers route.ts
find src/app/api -name "route.ts" | while read file; do
    # Créer le nouveau nom de fichier .js
    newfile="${file%.ts}.js"
    
    # Supprimer les annotations de type TypeScript et corriger les erreurs courantes
    sed -E '
        # Supprimer les types des paramètres de fonction
        s/: [A-Za-z<>{}[\] ,|]+//g
        # Supprimer les imports de types
        /import.*{.*}.*from.*@prisma\/client/d
        # Supprimer les lignes qui ne contiennent que des imports de types
        /^import.*type.*from/d
        # Corriger les chemins d'import cassés
        s/\[\.\.\.nextauth\/route/[...nextauth]\/route/g
        # Corriger la syntaxe enum de zod
        s/\.enum\((.*)\{/\.enum(\1, {/g
    ' "$file" > "$newfile"
    
    # Supprimer l'ancien fichier .ts
    rm "$file"
    
    echo "Converti: $file -> $newfile"
done

echo "Conversion terminée !"
