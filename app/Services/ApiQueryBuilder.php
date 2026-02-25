<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;

class ApiQueryBuilder
{
    protected Builder|Relation $query;
    protected Request $request;

    public function __construct(Builder|Relation $query, Request $request)
    {
        $this->query = $query;
        $this->request = $request;
    }

    public function apply(): Builder
    {
        $this->applySearch();
        $this->applyFilters();
        $this->applySort();

        return $this->query;
    }

    protected function applySearch(): void
    {
        if ($this->request->has('search')) {
            $searchTerm = $this->request->get('search');
            $searchableFields = $this->query->getModel()->searchable ?? [];

            if (!empty($searchableFields) && !empty($searchTerm)) {
                $this->query->where(function (Builder $q) use ($searchTerm, $searchableFields) {
                    foreach ($searchableFields as $field) {
                        $q->orWhere($field, 'like', "%{$searchTerm}%");
                    }
                });
            }
        }
    }

    protected function applyFilters(): void
    {
        if ($this->request->has('filter')) {
            $filters = $this->request->get('filter');
            foreach ($filters as $field => $value) {
                if (in_array($field, $this->query->getModel()->filterable ?? [])) {
                    $this->query->where($field, $value);
                }
            }
        }
    }

    protected function applySort(): void
    {
        if ($this->request->has('sort')) {
            $sort = explode(',', $this->request->get('sort'));
            $field = $sort[0];
            $direction = $sort[1] ?? 'asc';

            $allowedSorts = $this->query->getModel()->sortable ?? ['created_at'];

            if (in_array($field, $allowedSorts)) {
                $this->query->orderBy($field, $direction);
            }
        } else {
            $this->query->orderBy('created_at', 'desc');
        }
    }

    public function paginate($perPage = 15)
    {
        $limit = $this->request->get('limit', $perPage);
        return $this->query->paginate($limit);
    }
}
