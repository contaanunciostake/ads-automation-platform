"""
Serviço de integração com Large Language Models (LLMs) para geração de anúncios.
Este módulo fornece funcionalidades para gerar textos de anúncios baseados em criativos e informações da empresa.
"""

import json
import requests
from typing import Dict, List, Any, Optional
from datetime import datetime
import base64
import os
from abc import ABC, abstractmethod

class LLMProvider(ABC):
    """Classe base abstrata para provedores de LLM"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    @abstractmethod
    def generate_ad_copy(self, prompt: str, max_tokens: int = 150) -> Dict[str, Any]:
        """Gerar texto de anúncio baseado no prompt"""
        pass
    
    @abstractmethod
    def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """Analisar imagem para extrair contexto"""
        pass

class OpenAIProvider(LLMProvider):
    """Provedor OpenAI (GPT-4)"""
    
    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.base_url = "https://api.openai.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def generate_ad_copy(self, prompt: str, max_tokens: int = 150) -> Dict[str, Any]:
        """Gerar texto de anúncio usando GPT-4"""
        try:
            payload = {
                "model": "gpt-4",
                "messages": [
                    {
                        "role": "system",
                        "content": "Você é um especialista em copywriting para anúncios digitais. Crie textos persuasivos, claros e que gerem conversões."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": max_tokens,
                "temperature": 0.7
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "text": result["choices"][0]["message"]["content"].strip(),
                    "usage": result.get("usage", {}),
                    "model": "gpt-4"
                }
            else:
                return {
                    "success": False,
                    "error": f"API Error: {response.status_code} - {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """Analisar imagem usando GPT-4 Vision"""
        try:
            # Codificar imagem em base64
            with open(image_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode("utf-8")
            
            payload = {
                "model": "gpt-4-vision-preview",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Analise esta imagem e descreva os elementos visuais, cores, estilo, produtos ou serviços mostrados, e o sentimento geral transmitido. Esta análise será usada para criar textos de anúncios."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                "max_tokens": 300
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "description": result["choices"][0]["message"]["content"].strip(),
                    "model": "gpt-4-vision"
                }
            else:
                return {
                    "success": False,
                    "error": f"API Error: {response.status_code} - {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

class HuggingFaceProvider(LLMProvider):
    """Provedor Hugging Face"""
    
    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.base_url = "https://api-inference.huggingface.co/models"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def generate_ad_copy(self, prompt: str, max_tokens: int = 150) -> Dict[str, Any]:
        """Gerar texto de anúncio usando modelo Hugging Face"""
        try:
            # Usando um modelo de geração de texto em português
            model = "microsoft/DialoGPT-medium"
            
            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": max_tokens,
                    "temperature": 0.7,
                    "do_sample": True
                }
            }
            
            response = requests.post(
                f"{self.base_url}/{model}",
                headers=self.headers,
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    generated_text = result[0].get("generated_text", "")
                    return {
                        "success": True,
                        "text": generated_text.replace(prompt, "").strip(),
                        "model": model
                    }
                else:
                    return {
                        "success": False,
                        "error": "Resposta inesperada da API"
                    }
            else:
                return {
                    "success": False,
                    "error": f"API Error: {response.status_code} - {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """Analisar imagem usando modelo de visão computacional"""
        try:
            # Usando um modelo de descrição de imagens
            model = "Salesforce/blip-image-captioning-base"
            
            with open(image_path, "rb") as image_file:
                files = {"file": image_file}
                
                response = requests.post(
                    f"{self.base_url}/{model}",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    files=files
                )
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return {
                        "success": True,
                        "description": result[0].get("generated_text", ""),
                        "model": model
                    }
                else:
                    return {
                        "success": False,
                        "error": "Resposta inesperada da API"
                    }
            else:
                return {
                    "success": False,
                    "error": f"API Error: {response.status_code} - {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

class LocalLLMProvider(LLMProvider):
    """Provedor para LLM local (simulado para demonstração)"""
    
    def __init__(self, api_key: str = "local"):
        super().__init__(api_key)
    
    def generate_ad_copy(self, prompt: str, max_tokens: int = 150) -> Dict[str, Any]:
        """Simular geração de texto de anúncio"""
        # Templates de exemplo baseados no prompt
        templates = [
            "Descubra {produto} - A solução perfeita para {beneficio}. Experimente agora e transforme sua experiência!",
            "🚀 {produto} chegou para revolucionar! Aproveite nossa oferta especial e veja a diferença. Clique aqui!",
            "Você merece o melhor! {produto} oferece {beneficio} com qualidade incomparável. Saiba mais!",
            "Não perca tempo! {produto} é a escolha certa para quem busca {beneficio}. Garante já o seu!",
            "✨ Novidade: {produto}! A inovação que você esperava para {beneficio}. Confira agora!"
        ]
        
        # Extrair informações do prompt
        import random
        template = random.choice(templates)
        
        # Simular análise do prompt para extrair produto e benefício
        if "empresa" in prompt.lower():
            produto = "nossos produtos"
        else:
            produto = "nossa solução"
        
        if "economia" in prompt.lower():
            beneficio = "economizar tempo e dinheiro"
        elif "qualidade" in prompt.lower():
            beneficio = "máxima qualidade"
        else:
            beneficio = "resultados excepcionais"
        
        generated_text = template.format(produto=produto, beneficio=beneficio)
        
        return {
            "success": True,
            "text": generated_text,
            "model": "local-demo"
        }
    
    def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """Simular análise de imagem"""
        descriptions = [
            "Imagem profissional com cores vibrantes e design moderno. Transmite confiança e inovação.",
            "Visual clean e minimalista com foco no produto. Cores neutras que transmitem elegância.",
            "Imagem dinâmica com elementos gráficos chamativos. Ideal para público jovem e moderno.",
            "Design corporativo com paleta de cores sóbria. Transmite profissionalismo e credibilidade.",
            "Visual criativo com elementos artísticos. Desperta curiosidade e interesse do público."
        ]
        
        import random
        description = random.choice(descriptions)
        
        return {
            "success": True,
            "description": description,
            "model": "local-vision-demo"
        }

class AdCopyGenerator:
    """Gerador de textos de anúncios usando LLMs"""
    
    def __init__(self):
        self.providers = {}
        self.default_provider = None
    
    def add_provider(self, name: str, provider: LLMProvider, is_default: bool = False):
        """Adicionar um provedor de LLM"""
        self.providers[name] = provider
        if is_default or not self.default_provider:
            self.default_provider = name
    
    def generate_ad_variations(self, 
                             company_name: str, 
                             image_path: str = None, 
                             product_description: str = None,
                             target_audience: str = None,
                             platform: str = "facebook",
                             ad_objective: str = "conversions",
                             num_variations: int = 3,
                             provider_name: str = None) -> Dict[str, Any]:
        """Gerar múltiplas variações de texto de anúncio"""
        
        if not self.providers:
            return {
                "success": False,
                "error": "Nenhum provedor de LLM configurado"
            }
        
        provider_name = provider_name or self.default_provider
        provider = self.providers.get(provider_name)
        
        if not provider:
            return {
                "success": False,
                "error": f"Provedor {provider_name} não encontrado"
            }
        
        results = {
            "success": True,
            "company_name": company_name,
            "platform": platform,
            "objective": ad_objective,
            "variations": [],
            "image_analysis": None,
            "provider_used": provider_name
        }
        
        # Analisar imagem se fornecida
        if image_path and os.path.exists(image_path):
            image_analysis = provider.analyze_image(image_path)
            if image_analysis.get("success"):
                results["image_analysis"] = image_analysis["description"]
        
        # Construir prompt base
        prompt_parts = [
            f"Crie um texto de anúncio para {platform} para a empresa \'{company_name}\'."
        ]
        
        if product_description:
            prompt_parts.append(f"Produto/Serviço: {product_description}")
        
        if target_audience:
            prompt_parts.append(f"Público-alvo: {target_audience}")
        
        if results["image_analysis"]:
            prompt_parts.append(f"Contexto visual: {results["image_analysis"]}")
        
        prompt_parts.append(f"Objetivo da campanha: {ad_objective}")
        
        # Adicionar diretrizes específicas da plataforma
        platform_guidelines = {
            "facebook": "O texto deve ser envolvente, usar emojis quando apropriado, e incluir uma call-to-action clara. Máximo 125 caracteres para o texto principal.",
            "google": "O texto deve ser direto, incluir palavras-chave relevantes, e ter um headline de até 30 caracteres e descrição de até 90 caracteres.",
            "linkedin": "O texto deve ser profissional, focado em benefícios de negócio, e adequado para um público B2B.",
            "instagram": "O texto deve ser visual, usar hashtags relevantes, e ser adequado para um público jovem e engajado."
        }
        
        prompt_parts.append(platform_guidelines.get(platform, "O texto deve ser persuasivo e adequado para a plataforma."))
        
        base_prompt = " ".join(prompt_parts)
        
        # Gerar variações
        for i in range(num_variations):
            variation_prompt = f"{base_prompt}\n\nVariação {i+1}: Crie um texto único e criativo."
            
            result = provider.generate_ad_copy(variation_prompt)
            
            if result.get("success"):
                # Processar o texto gerado para extrair componentes
                generated_text = result["text"]
                
                # Tentar extrair headline e descrição
                lines = generated_text.split("\n")
                headline = lines[0].strip()
                description = "\n".join(lines[1:]).strip() if len(lines) > 1 else ""
                
                variation = {
                    "id": i + 1,
                    "headline": headline[:30] if platform == "google" else headline,
                    "description": description[:90] if platform == "google" else description,
                    "full_text": generated_text,
                    "platform": platform,
                    "character_count": len(generated_text),
                    "generated_at": datetime.now().isoformat()
                }
                
                results["variations"].append(variation)
            else:
                results["variations"].append({
                    "id": i + 1,
                    "error": result.get("error", "Erro na geração"),
                    "generated_at": datetime.now().isofor


