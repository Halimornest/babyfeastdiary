-- CreateTable
CREATE TABLE "IngredientEmbedding" (
    "id" SERIAL NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "embedding" JSONB NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'text-embedding-3-small',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngredientEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IngredientEmbedding_ingredientId_key" ON "IngredientEmbedding"("ingredientId");

-- AddForeignKey
ALTER TABLE "IngredientEmbedding" ADD CONSTRAINT "IngredientEmbedding_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
