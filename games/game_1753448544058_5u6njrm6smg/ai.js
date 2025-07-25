class AI {
    static updateCreature(creature, entities, deltaTime) {
        const nearestFood = this.findNearestFood(creature, entities);
        const nearestThreat = this.findNearestThreat(creature, entities);
        
        if (nearestThreat && this.getDistance(creature, nearestThreat) < 100) {
            this.flee(creature, nearestThreat);
        } else if (nearestFood) {
            this.pursue(creature, nearestFood);
        } else {
            this.wander(creature);
        }
    }

    static findNearestFood(creature, entities) {
        return entities
            .filter(e => creature.canEat(e))
            .reduce((nearest, current) => {
                const currentDist = this.getDistance(creature, current);
                const nearestDist = nearest ? this.getDistance(creature, nearest) : Infinity;
                return currentDist < nearestDist ? current : nearest;
            }, null);
    }

    static findNearestThreat(creature, entities) {
        return entities
            .filter(e => e.canEat(creature))
            .reduce((nearest, current) => {
                const currentDist = this.getDistance(creature, current);
                const nearestDist = nearest ? this.getDistance(creature, nearest) : Infinity;
                return currentDist < nearestDist ? current : nearest;
            }, null);
    }

    static getDistance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static pursue(creature, target) {
        const angle = Math.atan2(target.y - creature.y, target.x - creature.x);
        PhysicsSystem.applyForce(creature, creature.speed, angle);
    }

    static flee(creature, threat) {
        const angle = Math.atan2(creature.y - threat.y, creature.x - threat.x);
        PhysicsSystem.applyForce(creature, creature.speed * 1.5, angle);
    }

    static wander(creature) {
        if (Math.random() < 0.05) {
            const angle = Math.random() * Math.PI * 2;
            PhysicsSystem.applyForce(creature, creature.speed * 0.5, angle);
        }
    }
}